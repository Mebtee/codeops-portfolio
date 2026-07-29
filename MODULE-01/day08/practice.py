# Exercises
# Work through these in a file called day08/practice.py. Run each one and check the output before
# moving on.
# 1. Recursive sum. Write a recursive total(nums) that sums a list, and a recursive count_down(n)
# that prints n down to 1.
# 
def total(nums):
    if not nums:
        return 0
    return nums[0] + total(nums[1:])

def count_down(n):
    if n <= 0:
        return
    print(n)
    count_down(n - 1)

print(f"Sum [1, 2, 3, 4, 5]: {total([1, 2, 3, 4, 5])}")
print("Countdown from 5:")
count_down(5)

# 2. Binary search. Implement binary_search(items, target) on a sorted list and return the index,
# or -1. Test it on a sorted list of balances.

def binary_search(items, target):
    low = 0
    high = len(items) - 1

    while low <= high:
        mid = (low + high) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1

balances = [100.50, 250.00, 450.75, 1200.00, 5400.25]
target = 450.75

index = binary_search(balances, target)
print(f"Balance {target} found at index: {index}")


# 3. Merge sort. Implement merge_sort(items) and its merge helper. Confirm it matches sorted()
# on random lists.

def merge_sort(items):
    if len(items) <= 1:
        return items

    mid = len(items) // 2
    left = merge_sort(items[:mid])
    right = merge_sort(items[mid:])

    return merge(left, right)

def merge(left, right):
    sorted_result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            sorted_result.append(left[i])
            i += 1
        else:
            sorted_result.append(right[j])
            j += 1

    sorted_result.extend(left[i:])
    sorted_result.extend(right[j:])
    return sorted_result

import random
random_list = [random.randint(1, 100) for _ in range(10)]
sorted_custom = merge_sort(random_list)
sorted_builtin = sorted(random_list)

print(f"Original: {random_list}")
print(f"Sorted:   {sorted_custom}")
print(f"Matches built-in? {sorted_custom == sorted_builtin}")


# 4. Sort with a key. Given a list of (name, balance) tuples, sort it by balance descending using
# sorted(key=...).


accounts = [
    ("Alice", 1500.50),
    ("Bob", 4500.00),
    ("Charlie", 250.75),
    ("Diana", 3200.00)
]

sorted_accounts = sorted(accounts, key=lambda x: x[1], reverse=True)

for name, balance in sorted_accounts:
    print(f"{name}: ${balance:.2f}")
    
    
    # 5. Two pointers. Write has_pair(nums, target) for a sorted list, returning whether two values
# sum to the target.
    
def has_pair(nums, target):
    left = 0
    right = len(nums) - 1

    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return True
        elif current_sum < target:
            left += 1 
        else:
            right -= 1 

    return False

sorted_nums = [1, 3, 5, 8, 11, 18]
print(f"Has pair summing to 16? {has_pair(sorted_nums, 16)}")  
print(f"Has pair summing to 20? {has_pair(sorted_nums, 20)}")  