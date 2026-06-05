"use client";

interface BlacklistWarningModalProps {
  blacklistedCount: number;
  totalRecipients: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BlacklistWarningModal({
  blacklistedCount,
  totalRecipients,
  onConfirm,
  onCancel
}: BlacklistWarningModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Critical Warning: Blacklisted Numbers Detected
          </h3>

          <div className="mt-3 text-sm text-gray-500 bg-red-50 p-4 rounded-md border border-red-100">
            <p className="mb-2 font-medium text-red-800">
              {blacklistedCount} out of {totalRecipients} numbers have opted out previously.
            </p>
            <p>
              The following numbers have opted out. Forcing a broadcast to them severely increases the risk of your WhatsApp number being banned by Meta.
            </p>
            <p className="mt-2 font-bold text-red-900">
              Do you wish to proceed and remove them from the blacklist?
            </p>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Yes, force send
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel (Keep as Draft)
          </button>
        </div>
      </div>
    </div>
  );
}
