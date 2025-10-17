/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

export const handleError = (error, context = '') => {
  console.error(`[${context}] Error:`, error);
  
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  // MetaMask errors
  if (error.code === 4001) {
    userMessage = 'Transaction was cancelled by user.';
  } else if (error.code === -32002) {
    userMessage = 'Please check MetaMask - a request is already pending.';
  } else if (error.code === -32603) {
    userMessage = 'Internal error. Please try again.';
  }
  // Gas and fund errors
  else if (error.message && error.message.includes('insufficient funds')) {
    userMessage = 'Insufficient funds to complete this transaction.';
  } else if (error.message && error.message.includes('gas')) {
    userMessage = 'Transaction ran out of gas. Please try again.';
  }
  // Contract-specific errors
  else if (error.message && error.message.includes('Invalid Medicine ID')) {
    userMessage = 'Invalid medicine ID. Please check and try again.';
  } else if (error.message && error.message.includes('not a registered')) {
    userMessage = 'Your account is not authorized for this action. Please ensure you are registered.';
  } else if (error.message && error.message.includes('deactivated')) {
    userMessage = 'Your account has been deactivated. Please contact the administrator.';
  } else if (error.message && error.message.includes('not in')) {
    userMessage = 'Medicine is not in the correct stage for this action.';
  } else if (error.message && error.message.includes('already registered')) {
    userMessage = 'This address is already registered in the system.';
  }
  // Network errors
  else if (error.message && error.message.includes('network')) {
    userMessage = 'Network error. Please check your connection and ensure you are on the correct network.';
  }
  // Generic blockchain errors
  else if (error.message && error.message.includes('revert')) {
    userMessage = 'Transaction was reverted. Please check the requirements and try again.';
  }
  
  return {
    userMessage,
    technicalMessage: error.message || 'Unknown error',
    code: error.code || 'UNKNOWN',
    originalError: error
  };
};

/**
 * Handle MetaMask connection errors
 */
export const handleMetaMaskError = (error) => {
  if (!window.ethereum) {
    return {
      userMessage: 'MetaMask is not installed. Please install MetaMask to use this application.',
      technicalMessage: 'No ethereum provider found',
      code: 'NO_METAMASK'
    };
  }
  
  return handleError(error, 'MetaMask');
};

/**
 * Handle contract call errors
 */
export const handleContractError = (error, methodName = '') => {
  const errorInfo = handleError(error, `Contract:${methodName}`);
  
  // Additional context for contract errors
  if (error.message && error.message.includes('require')) {
    errorInfo.userMessage = 'Transaction requirements not met. ' + errorInfo.userMessage;
  }
  
  return errorInfo;
};

/**
 * Log error for debugging (in development) or monitoring (in production)
 */
export const logError = (error, context, additionalData = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message || 'Unknown error',
    code: error.code,
    stack: error.stack,
    ...additionalData
  };
  
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Log:', errorLog);
  }
  
  // In production, send to monitoring service (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error monitoring service
    // Example: Sentry.captureException(error, { contexts: { custom: errorLog } });
  }
  
  return errorLog;
};

const errorHandlers = {
  handleError,
  handleMetaMaskError,
  handleContractError,
  logError
};

export default errorHandlers;
