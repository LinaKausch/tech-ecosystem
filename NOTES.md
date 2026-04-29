# Notes

## DNA

    // dna: extension, color, speed, opacity, metalness
    // hidden dna: mass, healthScore, energy
    // extension: eg. cubeWidth = cubeSize + extension
    // energy: number to indicate how much energy the agent has to move
    // healthScore: probability to reproduce
    // mass: rate to survive harsh conditions?


## to do
    <!-- make new particles small  -->
    <!-- glow up the parents that spawning the new cubes -->
 <!-- storage for the whole system, no refresh, maybe hard refresh -->
<!--   
    <!-- display stats
    design stats --> 
<!-- 
    design qr code  -->

    camera animations +/-
    Add extra view on spawn and don't change the main view
    Think of overload animation

    
<!-- 
    system collapse -->
    design user input screens

    <!-- figure out the colors (limit color palete? new input colors don't bloom, too dark?) monochrome over time changing color? how? what is the logic behind?  -->

Do i want to add the button of not contributing to the system, what do i say then? 

### User UI feedback
- System is busy right now, wait a second. 
- System is ready for your input
- System failed and currently rebooting
- Your input has been sent
- System is overloaded, you input might destroy it Are you sure you want to send it? 
- System / Server is full


## Rules for system load / try
If the number of alive agents reaches 300, then the message = '! System overload...!' and agents start pulsing shake. 
If the number of agents reaches 500, then the message = '! System failure...!' and agents falls down (y--) - system collapsed - true.
If the system is collapsed = true, then camera zooms out, spins, zooms in to the "new system".
New system start with dominant colors agents, starts again. adds +1 to the "system tries", counter starts over again,  stats: total agents restarts, dead agents restarts, number of total generations restarts and grows only on the current system inputs and population controls (not overall), user input number stays and continious growing, population control stays and continious growing
When the spawning new agents message = 'Generating output...' and camera shakes. 

STATS:
timer - per system (done)
alive agents - per system (done)
dead agents - per system  (done)
total agents - per system (done)
average health - current (done)
average energy - current (done)
total generations - per system (done)
population control generations - per system (done)
user inputs - per system (done)
system tries - universl (done)
total user inputs - universal (done)
currently connected - current (2/5) (done)
Record of longest system try - universal


## oboarding
You are connected to the system.
You can contribute, but not control it.
Your input influences the system.
The system has limits.

### Dominant colors
    { name: 'red', start: 0, end: 30 },
    { name: 'orange', start: 30, end: 60 },
    { name: 'yellow', start: 60, end: 90 },
    { name: 'lime', start: 90, end: 120 },
    { name: 'green', start: 120, end: 150 },
    { name: 'teal', start: 150, end: 180 },
    { name: 'cyan', start: 180, end: 210 },
    { name: 'sky blue', start: 210, end: 240 },
    { name: 'blue', start: 240, end: 270 },
    { name: 'purple', start: 270, end: 300 },
    { name: 'magenta', start: 300, end: 330 },
    { name: 'pink', start: 330, end: 360 }
Check if the color code belongs to one of these names of the color, on the display only one color code can be displayed from the same name group. if there is nothing else to display check which name has the most cubes in that color and display another color from the same name. 

## Feedback funtions
 - Ready: default funtion Send button allows to send data to the display.
 - Feedback: after the data is sent this shows up. 
 - SystemOverloaded: if the system state is overloaded show this, send anyway allows to send data to the display, after the data is send Feedback is shown
 - NoContribution: show this if on onboarding user press no.   
 - SystemBusy: If the system is already working on the data sent, the messages of the system: Processing request, ianalysing data, generating output. after that check if system status overloaded (show systemOverloaded) or normal (show Ready)



## Remote todo
- think of the type of controls for extensions step
- add text so people can read behind the scenes
- responsive design of canvas and buttons and texts

## Display todo 
- Look into the camera for generating. maybe make it to be always in the same position and go back to the idle - more cinematic?

## Code todo
- Organise css
- Clean up unnescessary files
- Clean up the not used dna

do I need slider for the health?


## The Intake project
This project was created by Lina Kausch during an internship at PlusOne. It explores a real-time interactive system in which visual elements behave as data carriers inside a continuous digital environment.

The idea was born from the overwhelming feeling caused by growing technology. We rely on it every day for information, communication, and almost every step of our lives. Social media and evolving AI agents make things faster and more accessible, but they also demand constant attention. There is always more to consume, more to process, more to interact with. Over time, this constant intake of quick dopamine sources and easy results becomes overwhelming and can damage our attention.

This project became a system that absorbs every input it receives. Each interaction leaves a trace. Some fade, while others become part of the system and shape its appearance.

The system is designed to remain stable, but it has its limits. As more input is introduced, it becomes increasingly fragile. It can heal itself, but if pushed too far, it fails, collapses, and restarts.

This reflects a tension I notice in everyday life. Input is sometimes necessary for change, but it also has consequences. The system mirrors us, as humans become overwhelmed when there is no pause, no filter, and no limit.

You can interpret this work in your own way. It is not a fixed statement, but an invitation to observe how continuous input shapes both systems and ourselves.

Process

This project was developed through experimentation with Three.js and React. There was no clear vision of the outcome in the beginning. Many iterations were created, tested, and discarded along the way.

The process focused on building a system that evolves over time and responds to live input. Rather than following a strict plan, decisions were made through exploration, balancing technical possibilities with visual and interactive behavior.

The result is both a technical experiment and a way to express an idea through interaction, leaving space for interpretation.

