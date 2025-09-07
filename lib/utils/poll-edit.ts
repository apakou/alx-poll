import { EditPollData, EditPollFormData, EditPollOptionFormData, UpdatePollData } from '@/lib/types'

/**
 * Poll Data to Form Converter
 * 
 * Transforms database poll data into a form-friendly structure for editing.
 * Handles null values, date conversions, and option sorting to ensure
 * consistent form state initialization.
 * 
 * Key transformations:
 * - Converts null description/category to empty strings for form inputs
 * - Transforms ISO date string to Date object for date picker
 * - Sorts poll options by their display order
 * - Adds tracking flags (_isNew, _isDeleted) for option management
 * 
 * @param poll - Raw poll data from database with nested options
 * @returns Form-ready data structure with proper types and defaults
 * 
 * @example
 * ```tsx
 * const dbPoll = await fetchPoll(pollId)
 * const formData = pollToEditForm(dbPoll)
 * setFormState(formData) // Ready for form inputs
 * ```
 */
export function pollToEditForm(poll: EditPollData): EditPollFormData {
  return {
    title: poll.title,
    description: poll.description || '', // Convert null to empty string for form inputs
    category: poll.category || '', // Convert null to empty string for form inputs
    is_active: poll.is_active,
    allow_multiple_votes: poll.allow_multiple_votes,
    is_anonymous: poll.is_anonymous,
    expires_at: poll.expires_at ? new Date(poll.expires_at) : null, // Convert ISO string to Date object
    options: poll.poll_options
      .sort((a, b) => a.option_order - b.option_order) // Ensure consistent ordering
      .map(option => ({
        id: option.id,
        option_text: option.option_text,
        option_order: option.option_order,
        _isNew: false, // Mark as existing option
        _isDeleted: false, // Not marked for deletion
      }))
  }
}

/**
 * Form Data to Update Payload Converter
 * 
 * Processes form data and separates it into poll updates and option operations
 * for efficient database transactions. Handles data sanitization and categorizes
 * option changes into create, update, and delete operations.
 * 
 * Operation categorization:
 * - Create: New options (_isNew = true, not deleted)
 * - Update: Existing options (has ID, not new, not deleted)
 * - Delete: Existing options marked for deletion (_isDeleted = true)
 * 
 * Data sanitization:
 * - Trims whitespace from text fields
 * - Converts empty strings to null for optional fields
 * - Converts Date objects to ISO strings for database storage
 * 
 * @param formData - Form state containing poll and option data
 * @returns Structured update payload with separated poll and option operations
 * 
 * @example
 * ```tsx
 * const { pollUpdate, optionUpdates } = editFormToUpdate(formData)
 * 
 * // Update poll in database
 * await updatePoll(pollId, pollUpdate)
 * 
 * // Handle option operations
 * await createOptions(pollId, optionUpdates.toCreate)
 * await updateOptions(optionUpdates.toUpdate)
 * await deleteOptions(optionUpdates.toDelete)
 * ```
 */
export function editFormToUpdate(formData: EditPollFormData) {
  // Poll update data with sanitized values
  const pollUpdate: UpdatePollData = {
    title: formData.title.trim(), // Remove leading/trailing whitespace
    description: formData.description.trim() || null, // Empty string becomes null
    category: formData.category.trim() || null, // Empty string becomes null
    is_active: formData.is_active,
    allow_multiple_votes: formData.allow_multiple_votes,
    is_anonymous: formData.is_anonymous,
    expires_at: formData.expires_at ? formData.expires_at.toISOString() : null, // Convert Date to ISO string
  }

  // Extract options for creation (new options not marked for deletion)
  const toCreate = formData.options
    .filter(option => option._isNew && !option._isDeleted)
    .map(option => ({
      option_text: option.option_text.trim(),
      option_order: option.option_order,
    }))

  // Extract options for update (existing options with changes, not deleted)
  const toUpdate = formData.options
    .filter(option => !option._isNew && !option._isDeleted && option.id)
    .map(option => ({
      id: option.id!,
      option_text: option.option_text.trim(),
      option_order: option.option_order,
    }))

  // Extract option IDs for deletion (existing options marked for deletion)
  const toDelete = formData.options
    .filter(option => option._isDeleted && option.id)
    .map(option => option.id!)

  return {
    pollUpdate,
    optionUpdates: {
      toCreate,
      toUpdate,
      toDelete,
    }
  }
}

/**
 * Add New Option to Poll Form
 * 
 * Dynamically adds a new option to the form data with proper ordering.
 * Calculates the next available order number and marks the option as new.
 * Supports both empty options (for user input) and pre-filled options.
 * 
 * Order calculation:
 * - Finds the highest existing option_order value
 * - Increments by 1 to maintain sequential ordering
 * - Handles empty option arrays gracefully (starts at order 1)
 * 
 * @param formData - Current form state containing existing options
 * @param optionText - Optional pre-filled text for the new option
 * @returns Updated form data with new option appended
 * 
 * @example
 * ```tsx
 * const handleAddOption = () => {
 *   setFormData(addNewOption(formData, 'New Option'))
 * }
 * 
 * // Or add empty option for user input
 * const handleAddEmptyOption = () => {
 *   setFormData(addNewOption(formData))
 * }
 * ```
 */
export function addNewOption(formData: EditPollFormData, optionText: string = ''): EditPollFormData {
  // Find the highest option order to maintain sequential numbering
  const maxOrder = Math.max(0, ...formData.options.map(o => o.option_order))
  
  return {
    ...formData,
    options: [
      ...formData.options,
      {
        option_text: optionText,
        option_order: maxOrder + 1, // Increment for new option
        _isNew: true, // Mark as new for create operation
        _isDeleted: false, // Not marked for deletion
      }
    ]
  }
}

/**
 * Remove Option from Poll Form
 * 
 * Handles option removal with different strategies based on option state.
 * New options are removed immediately, while existing options are marked
 * for deletion to preserve data integrity during database operations.
 * 
 * Removal strategies:
 * - New options (_isNew = true): Remove completely from array
 * - Existing options: Mark as deleted (_isDeleted = true) for batch deletion
 * 
 * This approach ensures:
 * - No orphaned database records for new options
 * - Proper cleanup of existing options during save operation
 * - Ability to "undo" deletions before saving
 * 
 * @param formData - Current form state containing options
 * @param index - Array index of option to remove
 * @returns Updated form data with option removed or marked for deletion
 * 
 * @example
 * ```tsx
 * const handleRemoveOption = (index: number) => {
 *   setFormData(removeOption(formData, index))
 * }
 * ```
 */
export function removeOption(formData: EditPollFormData, index: number): EditPollFormData {
  const newOptions = [...formData.options]
  
  if (newOptions[index]._isNew) {
    // New option: remove completely (never existed in database)
    newOptions.splice(index, 1)
  } else {
    // Existing option: mark for deletion (preserve for database cleanup)
    newOptions[index] = { ...newOptions[index], _isDeleted: true }
  }

  return {
    ...formData,
    options: newOptions
  }
}

/**
 * Reorder Poll Options
 * 
 * Implements drag-and-drop reordering for poll options with automatic
 * order number recalculation. Filters out deleted options to ensure
 * clean reordering experience and maintains sequential numbering.
 * 
 * Reordering process:
 * 1. Filter out deleted options (they shouldn't be reorderable)
 * 2. Move option from source index to destination index
 * 3. Recalculate option_order for all options sequentially
 * 4. Return updated form data with new ordering
 * 
 * This ensures:
 * - Consistent option_order values (1, 2, 3, ...)
 * - Proper database storage with correct ordering
 * - Clean UI experience without gaps in numbering
 * 
 * @param formData - Current form state containing options
 * @param fromIndex - Source index of option being moved
 * @param toIndex - Destination index for the option
 * @returns Updated form data with reordered options
 * 
 * @example
 * ```tsx
 * const handleDragEnd = (result) => {
 *   if (!result.destination) return
 *   
 *   const { source, destination } = result
 *   setFormData(reorderOptions(formData, source.index, destination.index))
 * }
 * ```
 */
export function reorderOptions(formData: EditPollFormData, fromIndex: number, toIndex: number): EditPollFormData {
  // Filter out deleted options for clean reordering
  const newOptions = [...formData.options.filter(o => !o._isDeleted)]
  
  // Perform the reorder operation
  const [removed] = newOptions.splice(fromIndex, 1)
  newOptions.splice(toIndex, 0, removed)

  // Recalculate option_order for sequential numbering
  const reorderedOptions = newOptions.map((option, index) => ({
    ...option,
    option_order: index + 1 // Start from 1, not 0
  }))

  return {
    ...formData,
    options: reorderedOptions
  }
}

/**
 * Poll Form Validation
 * 
 * Comprehensive validation for poll form data before submission.
 * Checks business rules, data integrity, and user experience requirements.
 * Returns detailed error messages for user feedback.
 * 
 * Validation rules:
 * - Title: Required and non-empty after trimming
 * - Options: Minimum 2 active (non-deleted, non-empty) options
 * - Duplicates: No duplicate option text (case-insensitive)
 * - Expiry: Must be in the future if set (optional field)
 * 
 * Error accumulation:
 * - Collects all validation errors in a single pass
 * - Provides complete feedback for better user experience
 * - Returns both boolean validity and detailed error messages
 * 
 * @param formData - Form data to validate
 * @returns Validation result with isValid flag and error messages array
 * 
 * @example
 * ```tsx
 * const handleSubmit = () => {
 *   const validation = validateEditPollForm(formData)
 *   
 *   if (!validation.isValid) {
 *     setErrors(validation.errors)
 *     return
 *   }
 *   
 *   // Proceed with submission
 *   submitPoll(formData)
 * }
 * ```
 */
export function validateEditPollForm(formData: EditPollFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate poll title (required field)
  if (!formData.title.trim()) {
    errors.push('Poll title is required')
  }

  // Validate poll options (business rule: minimum 2 active options)
  const activeOptions = formData.options.filter(o => !o._isDeleted && o.option_text.trim())
  
  if (activeOptions.length < 2) {
    errors.push('At least 2 options are required')
  }

  // Check for duplicate options (case-insensitive comparison)
  const optionTexts = activeOptions.map(o => o.option_text.trim().toLowerCase())
  const uniqueTexts = new Set(optionTexts)
  
  if (optionTexts.length !== uniqueTexts.size) {
    errors.push('Duplicate options are not allowed')
  }

  // Validate expiry date (must be in future if provided)
  if (formData.expires_at && formData.expires_at <= new Date()) {
    errors.push('Expiry date must be in the future')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
