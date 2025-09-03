import { EditPollData, EditPollFormData, EditPollOptionFormData, UpdatePollData } from '@/lib/types'

/**
 * Convert database poll data to form data for editing
 */
export function pollToEditForm(poll: EditPollData): EditPollFormData {
  return {
    title: poll.title,
    description: poll.description || '',
    category: poll.category || '',
    is_active: poll.is_active,
    allow_multiple_votes: poll.allow_multiple_votes,
    is_anonymous: poll.is_anonymous,
    expires_at: poll.expires_at ? new Date(poll.expires_at) : null,
    options: poll.poll_options
      .sort((a, b) => a.option_order - b.option_order)
      .map(option => ({
        id: option.id,
        option_text: option.option_text,
        option_order: option.option_order,
        _isNew: false,
        _isDeleted: false,
      }))
  }
}

/**
 * Convert form data to update payload and separate option operations
 */
export function editFormToUpdate(formData: EditPollFormData) {
  // Poll update data
  const pollUpdate: UpdatePollData = {
    title: formData.title.trim(),
    description: formData.description.trim() || null,
    category: formData.category.trim() || null,
    is_active: formData.is_active,
    allow_multiple_votes: formData.allow_multiple_votes,
    is_anonymous: formData.is_anonymous,
    expires_at: formData.expires_at ? formData.expires_at.toISOString() : null,
  }

  // Option operations
  const toCreate = formData.options
    .filter(option => option._isNew && !option._isDeleted)
    .map(option => ({
      option_text: option.option_text.trim(),
      option_order: option.option_order,
    }))

  const toUpdate = formData.options
    .filter(option => !option._isNew && !option._isDeleted && option.id)
    .map(option => ({
      id: option.id!,
      option_text: option.option_text.trim(),
      option_order: option.option_order,
    }))

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
 * Add a new option to the form data
 */
export function addNewOption(formData: EditPollFormData, optionText: string = ''): EditPollFormData {
  const maxOrder = Math.max(0, ...formData.options.map(o => o.option_order))
  
  return {
    ...formData,
    options: [
      ...formData.options,
      {
        option_text: optionText,
        option_order: maxOrder + 1,
        _isNew: true,
        _isDeleted: false,
      }
    ]
  }
}

/**
 * Remove an option from the form data
 */
export function removeOption(formData: EditPollFormData, index: number): EditPollFormData {
  const newOptions = [...formData.options]
  
  if (newOptions[index]._isNew) {
    // If it's a new option, remove it completely
    newOptions.splice(index, 1)
  } else {
    // If it's an existing option, mark it for deletion
    newOptions[index] = { ...newOptions[index], _isDeleted: true }
  }

  return {
    ...formData,
    options: newOptions
  }
}

/**
 * Reorder options in the form data
 */
export function reorderOptions(formData: EditPollFormData, fromIndex: number, toIndex: number): EditPollFormData {
  const newOptions = [...formData.options.filter(o => !o._isDeleted)]
  const [removed] = newOptions.splice(fromIndex, 1)
  newOptions.splice(toIndex, 0, removed)

  // Update option_order for all options
  const reorderedOptions = newOptions.map((option, index) => ({
    ...option,
    option_order: index + 1
  }))

  return {
    ...formData,
    options: reorderedOptions
  }
}

/**
 * Validate form data before submission
 */
export function validateEditPollForm(formData: EditPollFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate title
  if (!formData.title.trim()) {
    errors.push('Poll title is required')
  }

  // Validate options
  const activeOptions = formData.options.filter(o => !o._isDeleted && o.option_text.trim())
  
  if (activeOptions.length < 2) {
    errors.push('At least 2 options are required')
  }

  // Check for duplicate options
  const optionTexts = activeOptions.map(o => o.option_text.trim().toLowerCase())
  const uniqueTexts = new Set(optionTexts)
  
  if (optionTexts.length !== uniqueTexts.size) {
    errors.push('Duplicate options are not allowed')
  }

  // Validate expiry date
  if (formData.expires_at && formData.expires_at <= new Date()) {
    errors.push('Expiry date must be in the future')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
