# 🚀 Comprehensive Real-Time Validation System

A complete validation system for Moby CRM with real-time feedback, progressive validation, and consistent UX patterns.

## ✨ Features

### 🔄 Real-Time Validation
- **Progressive Enhancement**: Starts with blur validation, upgrades to real-time after first interaction
- **Intelligent Debouncing**: 500ms delay prevents excessive validation calls
- **Visual Feedback**: Green checkmarks, red errors, yellow warnings with appropriate icons

### 📝 Form Components
- **ValidatedInput**: Text, email, password, currency with auto-formatting
- **ValidatedSelect**: Dropdowns with grouped options and search
- **ValidatedTextarea**: Auto-resize, character counting, expandable
- **ValidatedForm**: Complete form wrapper with error summary

### 🎯 Validation Rules
- **Built-in Rules**: Required, email, phone, CPF, CNPJ, currency, URL patterns
- **Custom Validators**: Async validation support with custom logic  
- **Formatting**: Auto-format phone numbers, CPF/CNPJ, currency as user types
- **Suggestions**: Email domain suggestions, typo corrections

### 🔐 Security & Accessibility  
- **Password Strength**: Visual strength meter with requirement checklist
- **WCAG 2.1 AA**: Full accessibility compliance with ARIA attributes
- **XSS Protection**: Input sanitization and validation
- **Progressive Enhancement**: Works without JavaScript

## 🏗️ Architecture

```
┌─ Global Validator ─────────────────────────────┐
│  - Rule management                             │
│  - Cross-field validation                      │
│  - Async validation queue                      │
└────────────────────────────────────────────────┘
          │
          ▼
┌─ Field Validation Hooks ──────────────────────┐
│  - useFieldValidation                          │
│  - useProgressiveFieldValidation               │
│  - useFormValidation                           │
└────────────────────────────────────────────────┘
          │
          ▼  
┌─ Validated Components ────────────────────────┐
│  - ValidatedInput / Email / Phone / Currency  │
│  - ValidatedSelect / Textarea                 │  
│  - ValidatedForm / FormSection / FormGrid     │
└────────────────────────────────────────────────┘
          │
          ▼
┌─ Validation Feedback ─────────────────────────┐
│  - Visual indicators                           │
│  - Error messages                             │
│  - Suggestions & help text                    │
└────────────────────────────────────────────────┘
```

## 🚦 Usage Examples

### Basic Form with Validation

```tsx
import { 
  ValidatedForm, 
  ValidatedInput, 
  ValidatedEmailInput,
  FormSection,
  COMMON_FORM_RULES 
} from '@/components/forms';

function MyForm() {
  const formRules = {
    name: COMMON_FORM_RULES.USER_NAME,
    email: COMMON_FORM_RULES.USER_EMAIL
  };

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Validated data:', values);
  };

  return (
    <ValidatedForm
      formId="my-form"
      fields={formRules}
      onSubmit={handleSubmit}
    >
      <FormSection title="User Information">
        <ValidatedInput
          id="name"
          name="name"
          formId="my-form"
          rules={formRules.name}
          label="Full Name"
          required
        />
        
        <ValidatedEmailInput
          id="email"
          name="email"
          formId="my-form"
          rules={formRules.email}
          label="Email Address"
          required
          checkDomain={true}
        />
      </FormSection>
    </ValidatedForm>
  );
}
```

### Custom Validation Rules

```tsx
import { ValidationRules } from '@/components/forms';

const customRules = {
  username: [
    ValidationRules.required('Username is required'),
    ValidationRules.minLength(3, 'Minimum 3 characters'),
    ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscore'),
    ValidationRules.custom(
      async (value) => {
        const response = await fetch(`/api/check-username/${value}`);
        return response.ok;
      },
      'Username already taken'
    )
  ]
};
```

### Progressive Validation

```tsx
import { useProgressiveFieldValidation } from '@/components/forms';

function CustomInput({ name, rules }) {
  const validation = useProgressiveFieldValidation({
    formId: 'my-form',
    fieldName: name,
    rules
  });

  return (
    <div>
      <input
        {...validation.getFieldProps()}
        className={validation.getValidationClasses()}
      />
      <ValidationFeedback 
        isValid={validation.isValid}
        isInvalid={validation.isInvalid}
        message={validation.getErrorMessage()}
      />
    </div>
  );
}
```

## 📋 Available Components

### Input Components
- `ValidatedInput` - Basic text input with validation
- `ValidatedEmailInput` - Email with domain checking 
- `ValidatedPhoneInput` - Brazilian phone format
- `ValidatedPasswordInput` - Password with strength meter
- `ValidatedCurrencyInput` - Brazilian currency format

### Select Components  
- `ValidatedSelect` - Dropdown with validation
- `ValidatedRequiredSelect` - Required dropdown
- `BooleanSelect` - Yes/No selection
- `StatusSelect` - Active/Inactive/Pending/Archived
- `PrioritySelect` - Low/Medium/High/Urgent

### Textarea Components
- `ValidatedTextarea` - Basic textarea with validation
- `ValidatedDescriptionTextarea` - Word count validation
- `ValidatedCommentTextarea` - Comment-specific validation

### Form Structure
- `ValidatedForm` - Form wrapper with validation
- `FormSection` - Grouped form sections  
- `FormGrid` - Responsive form layouts
- `FormField` - Individual field wrapper

### Feedback Components
- `ValidationFeedback` - Error/warning/success messages
- `PasswordStrengthIndicator` - Password strength meter
- `ValidationSummary` - Form-level error summary

## 🎨 Visual Feedback System

### Field States
- **Default**: Gray border, no icon
- **Focus**: Blue ring, focused styling  
- **Valid**: Green border + checkmark icon
- **Invalid**: Red border + alert icon  
- **Warning**: Yellow border + warning icon
- **Loading**: Spinner icon during async validation

### Error Messages
- **Progressive**: Show on blur first, then real-time
- **Contextual**: Field-specific error messages
- **Suggestions**: Auto-suggestions for common mistakes
- **Help Text**: Persistent help below fields

### Visual Indicators
```
✅ Valid field (green checkmark)
❌ Invalid field (red alert)  
⚠️ Warning (yellow warning)
ℹ️ Info message (blue info)
🔄 Validating (spinner)
💡 Suggestion available
```

## 🔧 Configuration

### Global Validator Setup

```tsx
import { globalValidator, ValidationRules } from '@/components/forms';

// Register form rules globally
globalValidator.registerForm('my-form', {
  email: [ValidationRules.required(), ValidationRules.email()],
  phone: [ValidationRules.phone()],
  password: [ValidationRules.password()]
});

// Validate specific field
const result = await globalValidator.validateField('my-form', 'email', 'user@example.com');

// Validate entire form  
const results = await globalValidator.validateForm('my-form', formData);
```

### Custom Formatters

```tsx
import { globalValidator } from '@/components/forms';

// Get built-in formatters
const phoneFormatter = globalValidator.getFormatter('phone');
const currencyFormatter = globalValidator.getFormatter('currency');

// Format values
const formattedPhone = phoneFormatter('11999887766'); // (11) 99988-7766
const formattedCurrency = currencyFormatter('150000'); // R$ 1.500,00
```

## 🧪 Testing

### Unit Tests
```tsx
import { render, screen, userEvent } from '@testing-library/react';
import { ValidatedEmailInput } from '@/components/forms';

test('shows error for invalid email', async () => {
  render(
    <ValidatedEmailInput
      id="email"
      name="email"
      formId="test"
      rules={[ValidationRules.email()]}
    />
  );
  
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'invalid-email');
  await userEvent.tab(); // Trigger blur
  
  expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
});
```

### Integration Tests
```tsx
import { render, screen, userEvent } from '@testing-library/react';
import { ValidatedForm } from '@/components/forms';

test('validates entire form on submit', async () => {
  const onSubmit = jest.fn();
  
  render(
    <ValidatedForm
      formId="test"
      fields={{ name: [ValidationRules.required()] }}
      onSubmit={onSubmit}
    >
      <ValidatedInput id="name" name="name" formId="test" rules={[]} />
    </ValidatedForm>
  );
  
  await userEvent.click(screen.getByText('Submit'));
  
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByText('Este campo é obrigatório')).toBeInTheDocument();
});
```

## 🎯 Best Practices

### Form Design
1. **Progressive Enhancement**: Start simple, add validation incrementally
2. **Clear Labels**: Use descriptive labels with help text
3. **Logical Grouping**: Group related fields with FormSection
4. **Responsive Layout**: Use FormGrid for responsive layouts

### Validation Rules
1. **Client + Server**: Always validate on both sides
2. **User-Friendly Messages**: Write clear, actionable error messages  
3. **Performance**: Use debouncing for expensive validations
4. **Accessibility**: Provide ARIA labels and descriptions

### Error Handling
1. **Early Feedback**: Show validation errors as soon as possible
2. **Recovery Guidance**: Help users fix errors with suggestions
3. **Form Summary**: Show all errors at the form level
4. **Success Feedback**: Confirm successful submissions

### Code Organization
1. **Reusable Rules**: Define validation rules once, reuse everywhere
2. **Type Safety**: Use TypeScript for better developer experience
3. **Custom Components**: Create domain-specific validated components
4. **Testing**: Test validation logic thoroughly

## 🔄 Migration Guide

### From Old Forms
1. Replace form wrapper with `ValidatedForm`
2. Replace input components with validated equivalents
3. Move validation rules to form configuration  
4. Remove manual error handling code
5. Test thoroughly with existing data

### Example Migration
```tsx
// Before
<form onSubmit={handleSubmit}>
  <input name="email" onChange={handleChange} />
  {errors.email && <span>{errors.email}</span>}
</form>

// After  
<ValidatedForm
  formId="my-form"
  fields={{ email: [ValidationRules.email()] }}
  onSubmit={handleSubmit}
>
  <ValidatedEmailInput
    id="email" 
    name="email"
    formId="my-form"
    rules={[ValidationRules.email()]}
  />
</ValidatedForm>
```

## 📚 Advanced Features

### Async Validation
```tsx
const rules = [
  ValidationRules.custom(
    async (value) => {
      const response = await fetch(`/api/validate/${value}`);
      return response.ok;
    },
    'Validation failed'
  )
];
```

### Cross-Field Validation
```tsx
const rules = [
  ValidationRules.custom(
    (value, formValues) => value === formValues.password,
    'Passwords must match'
  )
];
```

### Conditional Validation
```tsx
const rules = [
  ValidationRules.custom(
    (value, formValues) => {
      if (formValues.type === 'business') {
        return ValidationRules.cnpj().validator(value);
      }
      return ValidationRules.cpf().validator(value);
    },
    'Invalid document format'
  )
];
```

---

🎉 **The validation system is now fully implemented with comprehensive real-time validation, visual feedback, and consistent UX patterns across all forms in the Moby CRM!**