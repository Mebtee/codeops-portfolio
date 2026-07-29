# Exercises
# Work through these in a file called day05/practice.py. Run each one and check the output before
# moving on.
# 1. Vehicle hierarchy. Make a Vehicle base class with make, model, and a describe() method.
# Add Car and Truck subclasses.
# 2. Use super(). Give Truck a capacity attribute, setting make and model via super().__init__().
# 3. Override. Override describe() in Truck so it also mentions the capacity.
# 4. Polymorphism. Put several vehicles in a list and loop over them, calling describe() on each.
# 5. Abstract method. Make Vehicle an abstract base class with an abstract wheels() method, and
# have each subclass return its own number.

from abc import ABC, abstractmethod

class Vehicle(ABC):
    def __init__(self, make, model):
        self.make = make
        self.model = model

    def describe(self):
        print(f"This is a {self.make} {self.model}.")

    @abstractmethod
    def wheels(self):
        pass


class Car(Vehicle):
    
    def wheels(self):
        return 4


class Truck(Vehicle):
    def __init__(self, make, model, capacity):
        super().__init__(make, model)
        self.capacity = capacity

    def describe(self):
        print(f"This is a {self.make} {self.model} with a towing capacity of {self.capacity} lbs.")

    def wheels(self):
        return 6


my_car = Car("Toyota", "Corolla")
my_truck = Truck("Ford", "F-150", 14000)



mekina = [my_car, my_truck]

    
for vehicle in mekina:
    vehicle.describe()
    print(f"Wheels: {vehicle.wheels()}")
