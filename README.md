# CodeOps Portfolio

This repository is a bootcamp portfolio of Python practice projects for the CodeOps course.
Each day folder under `MODULE-01/` contains project work, practice exercises, and supporting files.

## Repository Structure

- `MODULE-01/day01/` through `MODULE-01/day09/` contain daily practice work.
- Each day includes a combination of `main.py`, `practice.py`, and `project.py` or notes.

## Day-by-Day Summary

### Day 01
- `notes.md`: terminal command review (`mkdir`, `ls`, `cd`, `touch`, `echo`) and basic Git commands (`git init`, `git push`).

### Day 02
- `main.py`: simple bill splitting example.
- `practice.py`: temperature classification and conditionals.
- `project.py`: customer tier classification based on balance.

### Day 03
- `main.py`: file reading from `transactions.txt` for spending data.
- `practice.py`: exercises using sets, loops, and collections.
- `project.py`: pharmacy inventory program that loads stock, updates quantities, reports low stock, and saves changes.
- `name.txt`, `pharmacy.txt`, `report.txt`, `transactions.txt`: sample input and output data files.

### Day 04
- `main.py`: introduction to the `Account` class with private balance, deposit, withdraw, and statement methods.
- `practice.py`: OOP and class design exercises.
- `project.py`: first version of the bank account management system using encapsulation.

### Day 05
- `main.py`: continued bank account practice and class design.
- `practice.py`: vehicle class hierarchy exercises.
- `project.py`: repeated bank account implementation with validated deposit and withdrawal behavior.

### Day 06
- `main.py`: refactoring the account model using SOLID principles, plus `AccountFactory` and observer notification.
- `practice.py`: exercises on SRP, OCP, Singleton, Factory, and Observer patterns.
- `project.py`: `BankConfig` singleton, account factory, observer alerts, and account type subclasses.

### Day 07
- `main.py`: account registry exercise with `AccountRegistry`, transaction history, and undo support.
- `practice.py`: algorithm and complexity exercises.
- `project.py`: registry implementation with O(1) lookup and ordered account listing.

### Day 08
- `main.py`: account registry enhancements with sorting, binary search, and recursive totals.
- `practice.py`: recursion, BFS/DFS, and priority queue exercises.
- `project.py`: account leaderboard, `find_by_number()`, and recursive transaction sum functionality.

### Day 09
- `main.py`: bank branch and BFS graph modeling.
- `practice.py`: BST, recursive tree height, BFS/DFS graph traversal, and priority queue practice.
- `project.py`: advanced banking project with `BankConfig`, observers, account registry improvements, branch tree total balance, and transfer graph BFS.

## How to Run

From the repository root, run any project file with Python. Example:

```bash
python MODULE-01/day09/project.py
```

## Notes

- Projects use Ethiopian birr (ETB) values in sample data.
- This repository captures learning progress over nine days of Python practice.
