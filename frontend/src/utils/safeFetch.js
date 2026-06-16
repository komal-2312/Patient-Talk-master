/**
 * Safe Fetch Utility
 * Handles JSON parsing errors and response validation
 */

export async function safeJsonParse(response) {
  if (!response) {
    throw new Error('No response received from server');
  }

  // Check HTTP status first
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `HTTP Error ${response.status}`;
    
    if (contentType?.includes('application/json')) {
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // Could not parse error JSON, use default message
      }
    } else {
      // Try to get error text
      try {
        const text = await response.text();
        if (text) errorMessage = text.slice(0, 100);
      } catch (e) {
        // Ignore text parsing errors
      }
    }
    throw new Error(errorMessage);
  }

  // Validate Content-Type
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }

  // Parse JSON with error handling
  try {
    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid JSON in server response');
    }
    throw err;
  }
}

/**
 * Safe fetch with timeout
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error) {
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return 'Request timeout. Please check your internet connection.';
  }
  if (error instanceof TypeError) {
    return 'Network error. Please check your internet connection.';
  }
  if (error instanceof SyntaxError) {
    return 'Server returned invalid response. Please try again.';
  }
  return error.message || 'An error occurred. Please try again.';
}
