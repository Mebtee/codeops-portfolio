#practice 1 unique city
citys = ['Addis Ababa', 'hawassa', 'Bahir Dar', 'Gondar', 'Shashamane', 'Dire Dawa', 'Adama', 'Jimma', 'Adama', 'Dire Dawa', 'Shashamane']
#before unique citys 
print(f"Number of cities in lists: {len(citys)}")

unique_citys = set(citys)
print(f"Number of unique cities in lists: {len(unique_citys)}")

#practice 2 Make a dictionary of five grocery items and prices in ETB. Loop with .items() to
#print each on its own line.

grocery_items = {
    'bread': 20,
    'milk': 85,
    'eggs': 30,
    'cheese': 50,
    'butter': 205
}


for item, price in grocery_items.items():
    print(f"{item}: {price:.2f} ETB")

#practice 3 Tax comprehension. Given prices = [100, 250, 400, 80], use one comprehension to build
#a list with 15% tax added

prices = [100, 250, 400, 80]
texed_price = [price *1.15 for price in prices]
print(f"{texed_price[0]:.2f}, {texed_price[1]:.2f}, {texed_price[2]:.2f}, {texed_price[3]:.2f}") #.2f formats the output to two decimal places only

#practice 4 Cheap items. From the same list, use a comprehension with a condition to keep only prices
#under 200

cheap_items = [price for price in prices if price < 200]
print(cheap_items)

#practice 5 Write & read. Write three customer names to names.txt, then open it and print each name
#back, one per line

with open('name.txt', 'w') as file:
    file.write("Mohammed Yasin\n")
    file.write("Abebe Bekele\n")
    file.write("Kebede Lemma\n")

    with open('name.txt', 'r') as f:
        for line in f:
            print(line.strip()) #.strip() removes the newline character from the end of each line when printing

#practice 6 Safe division. Ask the user for a number and divide 1000 by it, catching both ValueError and
#ZeroDivisionError

try:
    user_input = int(input("Enter a number to divide 1000 by it: "))

    result = 1000 / user_input
    print(f"Result: {result:.2f}")

except ValueError:
    print("Invalid input. Please Check the input and  enter a valid number.")

except ZeroDivisionError:
    print("You gave zero as input. Please enter a non-zero number.")

finally:
    print("task 6 operation Done. Thank you for using the program.")