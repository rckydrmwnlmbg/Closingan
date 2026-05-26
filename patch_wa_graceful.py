with open('apps/api/src/queue/workers/ai-reply.worker.ts', 'r') as f:
    content = f.read()

# Currently, if WA sends fail, we just throw error:
#         } catch (error) {
#          throw error;
#        }

# We want to escalate and alert if WA fails so it gracefully degrades, instead of just throwing and causing infinite retries without user knowing.

patch = """        } catch (error) {
          // Graceful Degradation for Fonnte down
          this.logger.error(
            { tenantId, error: error instanceof Error ? error.message : 'Unknown' },
            `WhatsApp Provider Error for conversation ${conversation.id}`
          );

          await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              state: 'ESCALATED',
              unreadCount: { increment: 1 },
            },
          });

          // Notifying the sales rep might fail too if WA is completely down, but we log it via audit or DLQ
          const waSession = await this.prisma.whatsappSession.findUnique({
            where: { tenantId },
          });

          if (waSession && waSession.phoneNumber) {
            const alertMessage = `🚨 [CLOSINGAN SYSTEM ERROR] 🚨\\n\\nGagal mengirim pesan WhatsApp ke pelanggan ${conversation.customerName || sender} (${sender}). Mohon periksa koneksi Fonnte.`;
            try {
              // Attempt to alert but ignore failure
              await this.whatsappProvider.sendMessage({
                tenantId,
                to: waSession.phoneNumber,
                message: alertMessage,
              });
            } catch (waError) {}
          }

          return { success: false, reason: 'wa_provider_error_escalated' };
        }"""

content = content.replace("""        } catch (error) {
          throw error;
        }""", patch)

with open('apps/api/src/queue/workers/ai-reply.worker.ts', 'w') as f:
    f.write(content)
