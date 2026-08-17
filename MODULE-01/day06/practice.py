# Exercises
# Work through these in a file called day06/practice.py. Run each one and check the output before
# moving on.
# 1. Spot the SRP violation. Take a Report class that builds, saves, and emails a report. Split it
# into three focused classes.
# 2. Refactor to OCP. Replace an if/elif that prints a shape's area by shape type with a small
# class hierarchy and one method.
# 3. Write a Singleton. Build an AppSettings Singleton holding a currency ("ETB") and confirm two
# instances are the same object.
# 4. Write a Factory. Create a ShapeFactory.create(kind) that returns a Circle, Square, or
# Triangle.
# 5. Write an Observer pair. Make a NewsAgency subject and two subscriber classes that print when
# notified.

class Report:
    def __init__(self,report):
        self.__report = report

    @property
    def report(self):
        return f"Report {self.__report}"

class ReportSave:
    def __init__(self, report):
        self.report = report 
        
    def save(self):
        with open("report.txt", "w") as file:
            file.write(str(self.report))

class ReportEmail:
    def __init__(self):
        self.email = "tame@gmail.com"

    def email():
        print("Report Email")


from abc import ABC, abstractmethod

class Shape(ABC): 
    @abstractmethod
    def area(self):
        pass

class Circle(Shape):
    PI = 3.14

    def __init__(self,radius ):
        self.radius   = radius 

    def area(self):
        return (self.PI * self.radius  * self.radius)

class Square(Shape):
    def __init__(self,width):
        self.width = width
        
    def area(self):
        return self.width * self.width

class Triangle(Shape):
    def __init__(self,base,height):
        self.base = base
        self.height = height
    def area(self):
        return 0.5 * self.base * self.height

s1 = Square(3)
c1 = Circle(5)
t1 = Triangle(3,5)

print(s1.area()) 
print(c1.area()) 


class AppSetting:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.currency = 1000
        return cls._instance
    
currency1 = AppSetting()
currency2 = AppSetting()

print(currency1 is currency2)

class ShapeFactory:
    def create(kind="",area=0,base=0,height=0):
        if kind == "Circle":
            return Circle(area)
        elif kind == "Square":
            return Square(area)
        elif kind == "Triangle":
            return Triangle(base,height)
        else:
            return "invalid kinds of type"
        
tri_angle = ShapeFactory.create("Triangle",base=10,height=2)

print(tri_angle.area()) 


class NewsAgency:
    def __init__(self):
        self._observers = []

    def subscribe(self,obj):
        self._observers.append(obj)

    def notify(self):
        for obj in self._observers:
            obj.news()
        
    def breaking_news(self):
        self.notify()



class TvNotification:
    def news(self):
        print("Start News, Turn Tv for Shows")

class MessageNottification:
    def news(self):
        print( "Start news, click to see the url")


ag1 = NewsAgency()

ag1.subscribe(TvNotification())
ag1.subscribe(MessageNottification())

ag1.breaking_news()    