"""
Code Evaluator
Evaluates Python code submissions against test cases
"""

import json
import subprocess
import sys
import tempfile
import os

def evaluate_code(code, test_cases_json):
    """
    Evaluate Python code against test cases
    
    Args:
        code: String containing Python code
        test_cases_json: JSON string or dict containing test cases
        Format: {
            "test_cases": [
                {"input": {...}, "output": expected_output},
                ...
            ]
        }
    
    Returns:
        Dictionary with evaluation results
    """
    if isinstance(test_cases_json, str):
        test_cases_data = json.loads(test_cases_json)
    else:
        test_cases_data = test_cases_json
    
    test_cases = test_cases_data.get('test_cases', [])
    
    if not test_cases:
        return {
            'is_correct': False,
            'passed': 0,
            'total': 0,
            'errors': ['No test cases provided'],
            'details': []
        }
    
    passed = 0
    total = len(test_cases)
    errors = []
    details = []
    
    # Create temporary file for code
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(code)
        temp_file = f.name
    
    try:
        for idx, test_case in enumerate(test_cases):
            test_input = test_case.get('input', {})
            expected_output = test_case.get('output')
            
            # Prepare input arguments
            input_args = []
            if isinstance(test_input, dict):
                # Convert dict to function arguments
                for key, value in test_input.items():
                    input_args.append(f"{key}={repr(value)}")
            elif isinstance(test_input, (list, tuple)):
                input_args = [repr(arg) for arg in test_input]
            else:
                input_args = [repr(test_input)]
            
            # Create test script - simpler approach
            # Try to extract function name from code
            function_name = None
            code_lines = code.split('\n')
            for line in code_lines:
                if 'def ' in line:
                    function_name = line.split('def ')[1].split('(')[0].strip()
                    break
            
            # Create test script
            if function_name:
                # Function-based code
                test_script = f"""
{code}

# Test the function
result = {function_name}({', '.join(input_args)})
print(repr(result))
"""
            else:
                # Script-based code - wrap it
                test_script = f"""
{code}

# If code doesn't define a function, try to capture output
# This is a simplified approach - assumes code prints or returns result
"""
            
            try:
                # Run test
                result = subprocess.run(
                    [sys.executable, '-c', test_script],
                    capture_output=True,
                    text=True,
                    timeout=5,  # 5 second timeout
                    cwd=os.path.dirname(temp_file)
                )
                
                if result.returncode != 0:
                    errors.append(f"Test {idx + 1}: Execution error - {result.stderr}")
                    details.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'error': result.stderr
                    })
                    continue
                
                # Parse output
                try:
                    actual_output = eval(result.stdout.strip())
                except:
                    actual_output = result.stdout.strip()
                
                # Compare outputs
                is_match = compare_outputs(actual_output, expected_output)
                
                if is_match:
                    passed += 1
                    details.append({
                        'test_case': idx + 1,
                        'passed': True,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': actual_output
                    })
                else:
                    details.append({
                        'test_case': idx + 1,
                        'passed': False,
                        'input': test_input,
                        'expected': expected_output,
                        'actual': actual_output
                    })
                    
            except subprocess.TimeoutExpired:
                errors.append(f"Test {idx + 1}: Timeout")
                details.append({
                    'test_case': idx + 1,
                    'passed': False,
                    'error': 'Timeout (exceeded 5 seconds)'
                })
            except Exception as e:
                errors.append(f"Test {idx + 1}: {str(e)}")
                details.append({
                    'test_case': idx + 1,
                    'passed': False,
                    'error': str(e)
                })
    
    finally:
        # Clean up temp file
        try:
            os.unlink(temp_file)
        except:
            pass
    
    return {
        'is_correct': passed == total,
        'passed': passed,
        'total': total,
        'score': (passed / total * 100) if total > 0 else 0,
        'errors': errors,
        'details': details
    }

def compare_outputs(actual, expected):
    """
    Compare actual and expected outputs
    Handles different types (int, float, str, list, dict, etc.)
    """
    # Type conversion for numeric comparisons
    if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
        # Allow small floating point differences
        return abs(actual - expected) < 0.0001
    
    # Direct comparison
    return actual == expected

def evaluate_code_simple(code, expected_output_str):
    """
    Simple code evaluation - just check if code runs without errors
    """
    try:
        exec(code)
        return {
            'is_correct': True,
            'passed': 1,
            'total': 1,
            'score': 100
        }
    except Exception as e:
        return {
            'is_correct': False,
            'passed': 0,
            'total': 1,
            'score': 0,
            'errors': [str(e)]
        }
