### NOTES TO SELF
"""
    Scriptet går absolut att köra. Testa.
    
    Men jag har lite problem med att, om jag i plt figuren klickar save, 
    så minskas storleken typ.
    
    Det går säkert att fixa, men jag bangar på att göra det nu :)
"""










# import the necessary packages
import numpy as np
import scipy.spatial as sp
import matplotlib.pyplot as plt
import cv2


image = cv2.imread("images/semseg_gt.png")
#convert BGR to RGB image
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

h,w,bpp = np.shape(image)

""" ### change color of all almost white pixels to green """
white = (255,255,255)
thres = 20
green = (0,255,0)
for py in range(0,h):
    for px in range(0,w):
      color = (image[py][px][0],image[py][px][1],image[py][px][2])
      distance = (color[0]-white[0])**2 + (color[1]-white[1])**2 + (color[2]-white[2])**2
      if distance < thres:
          image[py][px][0]=green[0]
          image[py][px][1]=green[1]
          image[py][px][2]=green[2]



# show image
plt.figure(figsize=(w, h))
plt.axis("off")
plt.imshow(image)

# save figure
# plt.savefig(f'images/semseg_gt_green.png',format='png',bbox_inches='tight',dpi=230)















""" ### change color of each pixel to nearest color in main_colors
#Stored all RGB values of main colors in a array
main_colors = [(0,0,0),
                  (255,255,255),
                  (255,0,0),
                  (0,255,0),
                  (0,0,255),
                  (255,255,0),
                  (0,255,255),
                  (255,0,255),
                  ] 
#Change colors of each pixel
#reference :https://stackoverflow.com/a/48884514/9799700
for py in range(0,h):
    for px in range(0,w):
      ########################
      #Used this part to find nearest color 
      #reference : https://stackoverflow.com/a/22478139/9799700
      input_color = (image[py][px][0],image[py][px][1],image[py][px][2])
      tree = sp.KDTree(main_colors)
      ditsance, result = tree.query(input_color) 
      nearest_color = main_colors[result]
      ###################
      
      image[py][px][0]=nearest_color[0]
      image[py][px][1]=nearest_color[1]
      image[py][px][2]=nearest_color[2]
"""




