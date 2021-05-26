# -*- coding: utf-8 -*-
"""
TEST QUIZ
"""


class MyClass(object):
    class_var = 1

    def __init__(self, i_var):
        self.i_var = i_var
        
        
        
sven = MyClass(i_var=42)

sven.class_var = 2
print(sven.class_var)








