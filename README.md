Pre-requisites:
- install node.js
- download all files

To set up the project:
1. run "npm install" to install all the dependencies listed in package.json and package-lock.json
2. run "npm start" to start the server listening on localhost:8888.
3. go to localhost:8888 to view the application

Link:

http://ec2-18-117-145-1.us-east-2.compute.amazonaws.com:8888/

User Manual:

Open Firefox or Safari (Chrome and Edge have security policies that prevent the application from running correctly) and navigate to http://ec2-18-117-145-1.us-east-2.compute.amazonaws.com:8888/. Click “Login” and log in to a Spotify account with premium.

By default, the app assumes the current playback state of the user’s account. To play another song, you can search using the menu in the top left and select an option that comes up. You can pause and resume a song at any time, which pauses and resumes the visualization that accompanies the song. The visualization is unique for each song, and is based on its musical properties, such as energy, danceability, tempo, and valence (A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).). You can repeat or move to the previous song with the back button, and move to the next song with the next button.

To add a comment that will potentially show for any user of the site while playing the song, enter the comment (max 50 characters) into the “Add Comment” box and hit “Post”. Comments pop up in random locations along the visualizer at the time in the song on which they were added. With the dropdown menu, you can remove comments altogether using the “None” option, show only your comments with the “Your Own” option, or see all comments (default) with the “All” option. Your selected comment toggling option will go into effect upon resetting the song or playing the next song.

Some potential applications of our project include a mood setter, which can give a sense of ambience towards both lively functions and independent relaxation. Users can log their ideas live while listening to music. Finally, jukeboxd enables listeners to find a sense of community and belonging based on their personal music tastes and ideas.