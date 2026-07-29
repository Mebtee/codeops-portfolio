# Exercises
# Work through these in a file called day09/practice.py. Run each one and check the output before
# moving on.
# 1. Build a BST. Write a Node class and an insert(root, value) function. Insert several balances,
# then print them with an in-order traversal — they should come out sorted.

from collections import deque
import heapq



class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None


def insert(root, value):
    if root is None:
        return Node(value)

    if value < root.value:
        root.left = insert(root.left, value)
    else:
        root.right = insert(root.right, value)

    return root


def inorder(root):

    if root is None:
        return

    inorder(root.left)
    print(root.value)
    inorder(root.right)


root = None

balances = [1000, 2000, 3000, 4000, 5000, 6000, 7000]

for balance in balances:
    root = insert(root, balance)

inorder(root)
print()


# 2. Tree depth. Write a recursive height(node) that returns the depth of a binary tree.

def height(node):

    if node is None:
        return 0

    left = height(node.left)
    right = height(node.right)

    return max(left, right) + 1


print(height(root))
print()


# 3. Graph BFS. Given an adjacency-list graph, implement bfs(graph, start) and return the set of
# reachable vertices.


graph = {
    "messi": ["cr7", "neymar"],
        "cr7": ["benzema"],
        "neymar": ["mbappe"],
        "benzema": [],
        "mbappe": []
    
}


def bfs(graph, start):

    visited = set()
    queue = deque()

    visited.add(start)
    queue.append(start)

    while queue:

        node = queue.popleft()

        for nxt in graph[node]:

            if nxt not in visited:
                visited.add(nxt)
                queue.append(nxt)

    return visited


print(bfs(graph, "messi"))
print()


# 4. Graph DFS. Implement dfs(graph, start) recursively, and compare the visit order with your
# BFS.

def dfs(graph, node, visited=None):

    if visited is None:
        visited = set()

    visited.add(node)

    print(node)

    for nxt in graph[node]:

        if nxt not in visited:
            dfs(graph, nxt, visited)

    return visited


dfs(graph, "messi")
print()


# 5. Priority queue. Use heapq to push five (priority, task) tuples in mixed order, then pop them all
# — they should come out by priority.

tasks = []

heapq.heappush(tasks, (3, "check account"))
heapq.heappush(tasks, (1, "send money"))
heapq.heappush(tasks, (5, "print report"))
heapq.heappush(tasks, (2, "create account"))
heapq.heappush(tasks, (4, "deposit"))

while tasks:
    print(heapq.heappop(tasks))