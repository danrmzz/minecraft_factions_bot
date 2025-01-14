## Acknowledgments

This bot was originally created by **Bleezed#2895** at [Sanded Development](https://discord.gg/B3e2aTkPCj) and forked for further development.


# Bot Setup Guide

Follow these steps to set up the bot:

1. **Extract the Files**  
   - Click the green **Code** button at the top of this repository.  
   - Select **Download ZIP** from the dropdown menu.  
   - Extract the downloaded `.zip` file to a location where you can easily access it.

2. **Install Node.js**  
   Download and install Node.js from [https://nodejs.org/en/](https://nodejs.org/en/).

3. **Install Dependencies**  
   Open a command prompt or terminal, and run the following command to install the required modules:  
   ```bash
   npm install discord.js@12.5.3 && npm install mathjs && npm install mineflayer && npm install mineflayer-tps && npm install moment && npm install ms@2.1.3
   ```

4. **Create and Add a Discord Bot**  
   - Create a new Discord bot and add it to your server with **Admin** permissions.  
   - Follow this [tutorial](https://www.technobezz.com/how-to-get-a-discord-bot-token/) to get your bot token.

5. **Update the `config.json` File**  
   - Open the `config.json` file in the bot folder.
   - Enter your **Minecraft account details** and **Discord bot token** into the appropriate fields.

6. **Run the Bot**  
   - Once all the previous steps are completed, run the `start.bat` file to start the bot.

7. **Bot Setup in Discord**  
   - In the Discord server where the bot is active, run the following command to complete the setup:  
     ```bash
     $setup
     ``` 
    - If the bot does not respond to your `$setup` message:  
           - Enable **message intents** in the Discord Developer Console on the same page where you get your bot token.  
           - Make sure to have **DMs enabled**.



# Features of the Bot

- **Wall Management**:
  - Commands to mark walls as clear or raise "WeeWoo" alerts during a raid.
  - Automatic wall check reminders sent to Discord and in-game.
  - Reminders are automatically disabled during shield downtimes.

- **Buffer Management**:
  - Commands to mark buffers as clear or alert for suspicious activity.
  - Reminders for buffer checks, including details of the last checker.
  - Reminders are automatically disabled during shield downtimes.

- **Cactus Management**:
  - Commands to mark cactus walls as clear or raise "WeeWoo" alerts for raids.
  - Reminders for cactus wall checks.

- **Faction Value Management**:
  - Tracks the value contributed by users to the faction.
  - Users can log their contributions, and the bot maintains a running total for each user.

- **Strike System**:
  - Commands to add or remove strikes for players, with reasons and total strikes displayed.
 
- **Faction Top Updates**:
  - Automatically retrieves and displays faction top (`/f top`) updates in a designated Discord channel.
  - Provides clear rankings, faction values, and changes since the last update.

- **Faction Chat Logging**:
  - Logs in-game faction chat messages directly to a designated Discord channel.
  - Allows users to send messages to in-game faction chat from Discord.

- **Roles and Permissions**:
  - Configurable role based permissions for accessing bot features.




