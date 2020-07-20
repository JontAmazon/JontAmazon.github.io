### Clustering and Classifying Radar Data using Deep Learning

**In the context of surveillance, intelligent radars can guess what a blob of radar detections encompasses. It may be unnecessary to call the guards if a rabbit enters the monitored area, but if a person or a vehicle does so, measures may be required.**

To perform such a guess, or __classification__, all detections sampled by the radar are first clustered (grouped together) based on the detections' spatial coordinates. Different clusters are assumed to comprise distinct objects. By observing the size of an object, radial velocity, and tracking how it moves in time, the class of the object is guessed, for example 'human', 'car' or 'rabbit'.

![Image](images/pipeline.png)

With this thesis we aim to improve upon the clustering step. In the original pipeline, clustering is performed considering only the detections' spatial coordinates, x and y. By first guessing the class of every detection in the monitored scene, however, it should be possible to cluster the detections more accurately.

Combining the clustering output with our guesses for each detection in the scene, we also get an alternative way of classifying objects: taking the most frequent class prediction of all the detections that comprise an object. If these classifications outperform those of the original pipeline, we would also be able to improve upon the classification step of the pipeline.

To guess the class of each detection, we use deep neural networks that learn from the data we feed them. The main network we investigate is PointNet++, from 2017. It learns features hierarchically at different scales, much like CNNs, which dominate the field of computer vision for camera images. CNNs can be seen as a mathematical replication of the functionality of a biological eye-brain combination, with neurons acting at different scales to extract features of objects at different abstraction levels, as discovered by Hubel and Wiesel.

The results are promising, and on par with the original pipeline, both for clustering and classification of objects. We show that the results improve with the amount of training data. We have also noted that the data contains some misleading labels for what is the ground truth. Thus, if more data was collected and the quality of the data was improved, we could improve upon the original pipeline.

Our hope is that classification could also be performed faster than the original pipeline. So if a human enters a scene, it can be labeled as a human more quickly, decreasing the probability of it leaving the scene before being classified. This would be very beneficial to the end user, in the context of surveillance.

### Example of a scene with 4 objects. The radar is positioned at the origin, pointing to the right.

![Image](images/semseg_gt.png)


