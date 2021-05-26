******************* NOTE TO SELF
******************* HTML and CSS stuff I want to remember, and so on...
*******************

"Can CSS be written inside of a HTML document?"
	- It can be, but is usually not.
	- Within the .HTML-document: CSS is written in either a <style> block or within the style attribute of an element.
		<style> 
		#my_id { background-colour: black; } 
		</style> 
	- As a separate file:
		In the head section of the HTML document:
		<link rel="stylesheet" type="text/css" href="my_stylesheet.css"> 


"Can JavaScript also be written inside of a HTML document?"
	- It can also be, but is usually not.
	- Within the .HTML document, JavaScript is written in either a <script> block or within a few different attributes (namely the event attributes).[1]
		<script> 
		document.getElementById('my_id').style.background = 'black'; 
		</script> 
		JS in attributes:
		<a href="javascript:aFunction();">Run aFunction()</a> 
		<div onclick="aFunction();">Click to run aFunction()</div> 
		<div onmouseover="aFunction();">Move mouse over this element to run aFunction()</div> 
	- As a separate file:
		<script src="my_javascript.js"></script> 

"How do we select the HTML elements to design from the .CSS file?"
	- There are a number of ways to select the HTML elements, for example with element selectors, class selectors and id selectors.
		(The ONLY difference between class selectors and id selectors is that the id selector always only refers to 1 element).
	- More advanced, there is also:
		- Combinator selectors (select elements based on a specific relationship between them)
		- Pseudo-class selectors (select elements based on a certain state)
		- Pseudo-elements selectors (select and style a part of an element)
		- Attribute selectors (select elements based on an attribute or attribute value)

	element selector example (.CSS code):
		h1 {
		  text-align: center;
		  color: red;
		}

	class selector example (.CSS code):
		.my-class {
		  text-align: center;
		  color: red;
		}
	
	id selector example (.CSS code):
		#id37 {
		  text-align: center;
		  color: red;
		}

	The CSS code also be inside the .HTML document. Just put it <style> HERE </style>.
	The HTML elements to be targeted of course need code like this:
		<h1 class="my-class">My headline.</p>
	












### CSS - BACKGROUNDS
### https://www.w3schools.com/css/css_background.asp

You can set the background color for any HTML elements:
Here, the <h1>, <p>, and <div> elements will have different background colors:
h1 {
  background-color: green;
}

div {
  background-color: lightblue;
}

p {
  background-color: yellow;
}


BACKGROUND IMAGE
- image repeat, horisontally &/ vertically
- background attachment
  ("The background-attachment property specifies whether the background image should scroll or be fixed (will not scroll with the rest of the page)"


OPACITY


### CSS - BORDERS
### https://www.w3schools.com/css/css_border.asp


The CSS border properties allow you to specify the style, width, and color of an element's border.


Set the property border-style:
p.dotted {border-style: dotted;}
p.dashed {border-style: dashed;}


BORDER WIDTH
BORDER COLOR
BORDER SIDES
ROUNDED BORDERS
BORDER MARGINS


### CSS - PADDING
### ...
