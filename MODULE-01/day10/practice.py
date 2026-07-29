
# Get Only Evens

def getOnlyEvens(arr):
    result = [num for i, num in enumerate(arr) if i % 2 == 0 and num % 2 == 0]
    return result

# Reverse Compare
def reverseCompare(num):
    reversed_num = int(str(num)[::-1])
    
    if num > reversed_num:
        return "Ok"
    else:
        return "Not ok"

# Return Factorial
def returnFactorial(n):
    
    if n == 0:
        return 1
        
    factorial = 1
    for i in range(1, n + 1):
        factorial *= i
        
    return factorial

# Meera Array
def checkMeera(arr):

    arr_set = set(arr)
    
    for n in arr:
        if (n * 2) in arr_set:
            return "I am NOT a Meera array"
            
    return "Meera array"

# Dual Array

def isDual(arr):
    counts = {}
    for num in arr:
        counts[num] = counts.get(num, 0) + 1
        
    for count in counts.values():
        if count != 2:
            return 0
        return 0 
        
    return 1

# Digital Clock
def digitalClock(seconds):
    seconds = seconds % 86400 
    
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


# TEST CASES
getOnlyEvens([1, 2, 3, 6, 4, 8])  
getOnlyEvens([0, 1, 2, 3, 4])   
    
reverseCompare(72) 
reverseCompare(23)  
    
print(returnFactorial(5)) 
print(returnFactorial(6))
print(returnFactorial(0)) 
    
checkMeera([10, 4, 0, 5])  
checkMeera([7, 4, 9])     
checkMeera([1, -6, 4, -3]) 
    
print(isDual([1, 2, 1, 3, 3, 2]))  
print(isDual([2, 5, 2, 5, 5]))      
print(isDual([3, 1, 1, 2, 2]))    

print(digitalClock(5025)) 
print(digitalClock(61201)) 
print(digitalClock(87000))  