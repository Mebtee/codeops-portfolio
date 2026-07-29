# Exercises
# Work through these in a file called day07/practice.py. Run each one and check the output before
# moving on.
# 1. Name the Big-O. For five short snippets (a list index, a single loop, a nested loop, a dict
# lookup, a binary search), write the Big-O of each as a comment and explain why.
# 2. List vs. dict lookup. Build a list and a dict of 100,000 fake account numbers. Time how long it
# takes to find one near the end in each.
# 3. Build a stack. Write a Stack class with push, pop, and peek, and use it to reverse a list of
# names.
# 4. Build a queue. Use collections.deque to model a bank service line: enqueue five customers,
# then serve them in order.
# 5. Singly linked list. Implement a Node and a LinkedList with push_front and a print_all() that
# walks the chain.



import time

accounts_list = [f"ACCT_{i}" for i in range(100000)]
accounts_dict = {f"ACCT_{i}": True for i in range(100000)}

target_account = "ACCT_99999" 

start_time = time.perf_counter()
_ = target_account in accounts_list
list_time = time.perf_counter() - start_time

start_time = time.perf_counter()
_ = target_account in accounts_dict
dict_time = time.perf_counter() - start_time

print(f"List lookup took: {list_time:.8f} seconds")
print(f"Dict lookup took: {dict_time:.8f} seconds")




class Stack:
    def __init__(self):
        self._items = []

    def push(self, item):
        self._items.append(item)

    def pop(self):
        if not self.is_empty():
            return self._items.pop()
        return None

    def peek(self):
        if not self.is_empty():
            return self._items[-1]
        return None

    def is_empty(self):
        return len(self._items) == 0

names = ["Alice", "Bob", "Charlie", "Diana"]
stack = Stack()

for name in names:
    stack.push(name)

reversed_names = []
while not stack.is_empty():
    reversed_names.append(stack.pop())

print(f"Original: {names}")
print(f"Reversed: {reversed_names}")





from collections import deque

bank_line = deque()

customers = ["Customer A", "Customer B", "Customer C", "Customer D", "Customer E"]
for customer in customers:
    bank_line.append(customer)
    print(f"Enqueued: {customer}")


while bank_line:
    served = bank_line.popleft()
    print(f"Serving: {served}")
    
    
    
    
    
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def push_front(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def print_all(self):
        current = self.head
        elements = []
        
        while current is not None:
            elements.append(str(current.data))
            current = current.next
            
        print(" -> ".join(elements))

ll = LinkedList()
ll.push_front("Task 3")
ll.push_front("Task 2")
ll.push_front("Task 1")

ll.print_all()


