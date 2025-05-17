// src/utils/toastUtils.ts
// Centralized helper functions for displaying Raycast toasts.
import { Toast, showToast as rayShowToast } from "@raycast/api"

/**
 * Displays a success toast message.
 * @param title - The title of the toast.
 * @param message - Optional message for the toast.
 * @param primaryAction - Optional primary action for the toast.
 */
export async function showSuccessToast(
  title: string,
  message?: string,
  primaryAction?: Toast.ActionOptions,
): Promise<void> {
  const options: Toast.Options = {
    style: Toast.Style.Success,
    title,
    message,
    primaryAction,
  }
  await rayShowToast(options)
}

/**
 * Displays an error toast message.
 * @param title - The title of the toast.
 * @param message - Optional message for the toast; can be an Error object or a string.
 * @param primaryAction - Optional primary action for the toast.
 */
export async function showErrorToast(
  title: string,
  message?: string | Error,
  primaryAction?: Toast.ActionOptions,
): Promise<void> {
  const toastMessage = message instanceof Error ? message.message : message
  const options: Toast.Options = {
    style: Toast.Style.Failure,
    title,
    message: toastMessage,
    primaryAction,
  }
  await rayShowToast(options)
}

/**
 * Displays an animated (loading) toast message.
 * @param title - The title of the toast.
 * @param message - Optional message for the toast.
 * @returns A Promise resolving to the `Toast` instance, which can be used to hide or update it.
 */
export async function showLoadingToast(title: string, message?: string): Promise<Toast> {
  const options: Toast.Options = {
    style: Toast.Style.Animated,
    title,
    message,
  }
  return rayShowToast(options)
}

/**
 * Hides an active toast.
 * Useful for toasts shown via `showLoadingToast` that need to be dismissed manually.
 * @param toast - The toast instance (obtained from `showLoadingToast`) to hide.
 */
export async function hideToast(toast: Toast): Promise<void> {
  await toast.hide()
}

/**
 * Updates properties of an existing, visible toast.
 * Note: The Raycast API updates the toast instance directly. This function provides a clear interface.
 * @param toast - The toast instance to update (obtained from `showLoadingToast`).
 * @param options - An object with `Toast.Options` properties to update on the toast.
 */
export async function updateToast(toast: Toast, options: Partial<Toast.Options>): Promise<void> {
  // Update properties of the existing toast object.
  // Raycast's `showToast` mechanism means that modifying these properties
  // on the instance returned by `showToast` will update the visible toast.
  if (options.title !== undefined) toast.title = options.title
  if (options.message !== undefined) toast.message = options.message
  if (options.style !== undefined) toast.style = options.style
  if (options.primaryAction !== undefined) toast.primaryAction = options.primaryAction
  if (options.secondaryAction !== undefined) toast.secondaryAction = options.secondaryAction
}
