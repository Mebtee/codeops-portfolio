# Exercises
# Work through these in a file called day04/practice.py. Run each one and check the output before
# moving on.
# 1. Book class. Define Book with title, author, and pages. Add a describe() method that prints a
# one-line summary. Create two books.
# 2. Product class. Define Product with name, price (ETB), and quantity. Add restock(n) and
# sell(n) methods that change the quantity.
# 3. Make it private. Change quantity to a private __quantity and add a @property getter for it.
# 4. Validate. Add a setter (or guard in sell) that refuses to let the quantity go below zero.



class Book:
    def __init__(self, title, author, pages):
        self.title = title
        self.author = author
        self.pages = pages
        
    def describe(self):
        print(f"{self.title} by {self.author} has {self.pages} pages")
        
book1 = Book("Lijnet", "zenebe wela", 350)
book2 = Book("Emegua", "Alemayehu Wase", 370)


book1.describe()
book2.describe()


class Product():
    def __init__(self, name, price, quantity):
        self.name = name
        self.price = price
        self.__quantity = quantity
    
    def restock(self, n):
        self.__quantity += n

    def sell(self, n):
        if self.__quantity >= n:
            self.__quantity -= n
        else:
            print("Not enough quantity in stock")

    @property
    def quantity(self):
        return self.__quantity
# 5. Prove independence. Create three Product objects, change one, and show the other two are
# unaffected.

product1 = Product("Laptop", 50000, 10)
product2 = Product("Phone", 20000, 5)
product3 = Product("Tablet", 15000, 8)

print(f"Product 1 quantity: {product1.quantity}")
product1.sell(3)
product1.restock(5)
print(f"Product 1 quantity after sale: {product1.quantity}")
print(f"Product 2 quantity: {product2.quantity}")
print(f"Product 3 quantity: {product3.quantity}")