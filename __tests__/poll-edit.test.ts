import {
  pollToEditForm,
  editFormToUpdate,
  addNewOption,
  removeOption,
  reorderOptions,
  validateEditPollForm
} from '@/lib/utils/poll-edit'
import { EditPollData, EditPollFormData } from '@/lib/types'

describe('Poll Edit Utilities', () => {
  // Mock data for testing
  const mockPoll: EditPollData = {
    id: 'poll-1',
    title: 'Test Poll',
    description: 'A test poll description',
    category: 'Test Category',
    is_active: true,
    allow_multiple_votes: false,
    is_anonymous: true,
    expires_at: '2025-12-31T23:59:59Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    created_by: 'user-1',
    total_votes: 10,
    poll_options: [
      {
        id: 'option-1',
        option_text: 'Option 1',
        option_order: 1,
        votes_count: 5
      },
      {
        id: 'option-2',
        option_text: 'Option 2',
        option_order: 2,
        votes_count: 3
      },
      {
        id: 'option-3',
        option_text: 'Option 3',
        option_order: 3,
        votes_count: 2
      }
    ]
  }

  const mockFormData: EditPollFormData = {
    title: 'Test Poll',
    description: 'A test poll description',
    category: 'Test Category',
    is_active: true,
    allow_multiple_votes: false,
    is_anonymous: true,
    expires_at: new Date('2025-12-31T23:59:59Z'),
    options: [
      {
        id: 'option-1',
        option_text: 'Option 1',
        option_order: 1,
        _isNew: false,
        _isDeleted: false
      },
      {
        id: 'option-2',
        option_text: 'Option 2',
        option_order: 2,
        _isNew: false,
        _isDeleted: false
      }
    ]
  }

  describe('pollToEditForm', () => {
    it('should convert poll data to form data correctly', () => {
      const result = pollToEditForm(mockPoll)

      expect(result.title).toBe(mockPoll.title)
      expect(result.description).toBe(mockPoll.description)
      expect(result.category).toBe(mockPoll.category)
      expect(result.is_active).toBe(mockPoll.is_active)
      expect(result.allow_multiple_votes).toBe(mockPoll.allow_multiple_votes)
      expect(result.is_anonymous).toBe(mockPoll.is_anonymous)
      expect(result.expires_at).toEqual(new Date(mockPoll.expires_at!))
      expect(result.options).toHaveLength(3)
      expect(result.options[0].option_text).toBe('Option 1')
      expect(result.options[0]._isNew).toBe(false)
      expect(result.options[0]._isDeleted).toBe(false)
    })

    it('should handle null description and category', () => {
      const pollWithNulls = { ...mockPoll, description: null, category: null }
      const result = pollToEditForm(pollWithNulls)

      expect(result.description).toBe('')
      expect(result.category).toBe('')
    })

    it('should handle null expires_at', () => {
      const pollWithoutExpiry = { ...mockPoll, expires_at: null }
      const result = pollToEditForm(pollWithoutExpiry)

      expect(result.expires_at).toBeNull()
    })

    it('should sort options by option_order', () => {
      const unorderedPoll = {
        ...mockPoll,
        poll_options: [
          { id: 'option-3', option_text: 'Option 3', option_order: 3, votes_count: 2 },
          { id: 'option-1', option_text: 'Option 1', option_order: 1, votes_count: 5 },
          { id: 'option-2', option_text: 'Option 2', option_order: 2, votes_count: 3 }
        ]
      }
      const result = pollToEditForm(unorderedPoll)

      expect(result.options[0].option_text).toBe('Option 1')
      expect(result.options[1].option_text).toBe('Option 2')
      expect(result.options[2].option_text).toBe('Option 3')
    })
  })

  describe('editFormToUpdate', () => {
    it('should convert form data to update payload correctly', () => {
      const result = editFormToUpdate(mockFormData)

      expect(result.pollUpdate.title).toBe('Test Poll')
      expect(result.pollUpdate.description).toBe('A test poll description')
      expect(result.pollUpdate.category).toBe('Test Category')
      expect(result.pollUpdate.is_active).toBe(true)
      expect(result.pollUpdate.allow_multiple_votes).toBe(false)
      expect(result.pollUpdate.is_anonymous).toBe(true)
      expect(result.pollUpdate.expires_at).toBe(mockFormData.expires_at?.toISOString())
    })

    it('should trim whitespace from text fields', () => {
      const formWithWhitespace = {
        ...mockFormData,
        title: '  Test Poll  ',
        description: '  Description  ',
        category: '  Category  '
      }
      const result = editFormToUpdate(formWithWhitespace)

      expect(result.pollUpdate.title).toBe('Test Poll')
      expect(result.pollUpdate.description).toBe('Description')
      expect(result.pollUpdate.category).toBe('Category')
    })

    it('should convert empty strings to null for optional fields', () => {
      const formWithEmptyStrings = {
        ...mockFormData,
        description: '',
        category: ''
      }
      const result = editFormToUpdate(formWithEmptyStrings)

      expect(result.pollUpdate.description).toBeNull()
      expect(result.pollUpdate.category).toBeNull()
    })

    it('should separate options into create, update, and delete operations', () => {
      const formWithMixedOptions = {
        ...mockFormData,
        options: [
          // Existing option to update
          {
            id: 'option-1',
            option_text: 'Updated Option 1',
            option_order: 1,
            _isNew: false,
            _isDeleted: false
          },
          // New option to create
          {
            option_text: 'New Option',
            option_order: 2,
            _isNew: true,
            _isDeleted: false
          },
          // Existing option to delete
          {
            id: 'option-2',
            option_text: 'Option 2',
            option_order: 3,
            _isNew: false,
            _isDeleted: true
          }
        ]
      }
      const result = editFormToUpdate(formWithMixedOptions)

      expect(result.optionUpdates.toCreate).toHaveLength(1)
      expect(result.optionUpdates.toCreate[0].option_text).toBe('New Option')

      expect(result.optionUpdates.toUpdate).toHaveLength(1)
      expect(result.optionUpdates.toUpdate[0].option_text).toBe('Updated Option 1')

      expect(result.optionUpdates.toDelete).toHaveLength(1)
      expect(result.optionUpdates.toDelete[0]).toBe('option-2')
    })
  })

  describe('addNewOption', () => {
    it('should add a new option with correct order', () => {
      const result = addNewOption(mockFormData, 'New Option')

      expect(result.options).toHaveLength(3)
      expect(result.options[2].option_text).toBe('New Option')
      expect(result.options[2].option_order).toBe(3)
      expect(result.options[2]._isNew).toBe(true)
      expect(result.options[2]._isDeleted).toBe(false)
    })

    it('should add empty option when no text provided', () => {
      const result = addNewOption(mockFormData)

      expect(result.options[2].option_text).toBe('')
    })

    it('should handle empty options array', () => {
      const emptyFormData = { ...mockFormData, options: [] }
      const result = addNewOption(emptyFormData, 'First Option')

      expect(result.options).toHaveLength(1)
      expect(result.options[0].option_order).toBe(1)
    })
  })

  describe('removeOption', () => {
    it('should remove new option completely', () => {
      const formWithNewOption = addNewOption(mockFormData, 'New Option')
      const result = removeOption(formWithNewOption, 2)

      expect(result.options).toHaveLength(2)
      expect(result.options.every(opt => opt.option_text !== 'New Option')).toBe(true)
    })

    it('should mark existing option for deletion', () => {
      const result = removeOption(mockFormData, 0)

      expect(result.options).toHaveLength(2)
      expect(result.options[0]._isDeleted).toBe(true)
      expect(result.options[0].option_text).toBe('Option 1')
    })
  })

  describe('reorderOptions', () => {
    it('should reorder options correctly', () => {
      const formWithThreeOptions = {
        ...mockFormData,
        options: [
          ...mockFormData.options,
          {
            id: 'option-3',
            option_text: 'Option 3',
            option_order: 3,
            _isNew: false,
            _isDeleted: false
          }
        ]
      }

      const result = reorderOptions(formWithThreeOptions, 0, 2)

      expect(result.options[0].option_text).toBe('Option 2')
      expect(result.options[1].option_text).toBe('Option 3')
      expect(result.options[2].option_text).toBe('Option 1')
      
      // Check that option_order is updated
      expect(result.options[0].option_order).toBe(1)
      expect(result.options[1].option_order).toBe(2)
      expect(result.options[2].option_order).toBe(3)
    })

    it('should exclude deleted options from reordering', () => {
      const formWithDeletedOption = {
        ...mockFormData,
        options: [
          ...mockFormData.options,
          {
            id: 'option-3',
            option_text: 'Option 3',
            option_order: 3,
            _isNew: false,
            _isDeleted: true
          }
        ]
      }

      const result = reorderOptions(formWithDeletedOption, 0, 1)

      // Should only have 2 options (deleted one excluded)
      expect(result.options).toHaveLength(2)
    })
  })

  describe('validateEditPollForm', () => {
    it('should validate successfully with valid data', () => {
      const result = validateEditPollForm(mockFormData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should require poll title', () => {
      const formWithoutTitle = { ...mockFormData, title: '' }
      const result = validateEditPollForm(formWithoutTitle)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Poll title is required')
    })

    it('should require at least 2 options', () => {
      const formWithOneOption = {
        ...mockFormData,
        options: [mockFormData.options[0]]
      }
      const result = validateEditPollForm(formWithOneOption)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least 2 options are required')
    })

    it('should not count deleted options', () => {
      const formWithDeletedOptions = {
        ...mockFormData,
        options: [
          { ...mockFormData.options[0], _isDeleted: true },
          mockFormData.options[1]
        ]
      }
      const result = validateEditPollForm(formWithDeletedOptions)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least 2 options are required')
    })

    it('should not count empty options', () => {
      const formWithEmptyOption = {
        ...mockFormData,
        options: [
          { ...mockFormData.options[0], option_text: '' },
          mockFormData.options[1]
        ]
      }
      const result = validateEditPollForm(formWithEmptyOption)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('At least 2 options are required')
    })

    it('should detect duplicate options', () => {
      const formWithDuplicates = {
        ...mockFormData,
        options: [
          mockFormData.options[0],
          { ...mockFormData.options[1], option_text: 'Option 1' }
        ]
      }
      const result = validateEditPollForm(formWithDuplicates)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Duplicate options are not allowed')
    })

    it('should be case-insensitive for duplicate detection', () => {
      const formWithCaseDuplicates = {
        ...mockFormData,
        options: [
          mockFormData.options[0],
          { ...mockFormData.options[1], option_text: 'OPTION 1' }
        ]
      }
      const result = validateEditPollForm(formWithCaseDuplicates)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Duplicate options are not allowed')
    })

    it('should validate expiry date is in the future', () => {
      const pastDate = new Date('2020-01-01')
      const formWithPastExpiry = {
        ...mockFormData,
        expires_at: pastDate
      }
      const result = validateEditPollForm(formWithPastExpiry)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Expiry date must be in the future')
    })

    it('should allow null expiry date', () => {
      const formWithoutExpiry = {
        ...mockFormData,
        expires_at: null
      }
      const result = validateEditPollForm(formWithoutExpiry)

      expect(result.isValid).toBe(true)
    })

    it('should accumulate multiple errors', () => {
      const invalidForm = {
        ...mockFormData,
        title: '',
        expires_at: new Date('2020-01-01'),
        options: [
          { ...mockFormData.options[0], option_text: 'Same Option' },
          { ...mockFormData.options[1], option_text: 'Same Option' }
        ]
      }
      const result = validateEditPollForm(invalidForm)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('Poll title is required')
      expect(result.errors).toContain('Expiry date must be in the future')
      expect(result.errors).toContain('Duplicate options are not allowed')
    })
  })
})
