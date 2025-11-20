/**
 * Mock workflow validator for demo
 */

export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateWorkflow(workflow: any): WorkflowValidationResult {
  console.log('🎭 Demo: Validating workflow', workflow);
  
  return {
    isValid: true,
    errors: [],
    warnings: ['Demo mode - validation is mocked']
  };
}

export function validateWorkflowStep(step: any): WorkflowValidationResult {
  console.log('🎭 Demo: Validating workflow step', step);
  
  return {
    isValid: true,
    errors: [],
    warnings: []
  };
}

const WorkflowValidator = {
  validateWorkflow,
  validateWorkflowStep
};

export default WorkflowValidator;