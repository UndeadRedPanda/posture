# Posture
Posture is a simple configurable mock SMTP server to test your emails built with Deno. It is not meant to actually deliver anything. This server was designed only for receiving and saving SMTP commands for development, debugging or testing purposes. 

The SMTP server of this project implements the relevant parts of [RFC 2821](https://tools.ietf.org/html/rfc2821) to the best of my capacity/desire to for this project. To see what we've implemented, you can peep [the implementation list](#implentation-details).f there are certain parts of the standard that you need that aren't supported or don't work as they should, feel free to make a PR or file an issue!

## How to use
```sh
$ deno install --allow-net --allow-read --allow-write --allow-env path/to/repo
```

I don't think I need to tell you why we need net access. As for the other ones:
- **read** for the config file and SQLite if you happen to use that;
- **write** if you happen to use SQLite;
- **env** to allow access to environment variables;

## Supported Databases
- MongoDB

## Development
### Denon
A simple Denon config is available to run the project in development.
```bash
denon start
```

### Testing
TODO

## Contributing
TODO

## TODO
Here's a list of the tasks that are left to do:

### SMTP
#### Guarantees
- Handle commands
	- [ ] HELO/EHLO
	- [ ] MAIL
	- [ ] RCPT
	- [ ] DATA
	- [ ] RSET
	- [ ] VRFY
	- [ ] EXPN
	- [ ] HELP
	- [ ] QUIT
	- [ ] NOOP
- Connect to a Database (SQLite, MySQL, PostgreSQL and MongoDB)
- Save to Database
- Get certain SMTP info from environment vars
- Tests
- Documentation
- CI/CD

#### Maybes
- Run standalone (For Database output only or Server + Client running on a separate system)
- Implement some kind of communication system when new messages are added to the Database so a third-party could listen

### Server
#### Guarantees
- REST API or GraphQL to get the available messages
- Tests
- Documentation
- CI/CD

#### Maybes
- Run standalone (For an SMTP and client running on two other separate systems)
- Run as SMTP + Server configuration
- Add some auth to access the API to secure emails
- Websocket or long polling connections to clients, SMTP needs to implement some form of communication first

### Client
#### Guarantees
- Choose framework
- Data fetching mechanisms
- List view of sent emails
- Detail view of emails

#### Maybes
- Run standalone (For a SMTP + Server config running on separate system)
- Run as Server + Client configuration
- Add some form of login to access the Server APIs
- Server-side rendering if the chosen framework needs it
- PWA (This probably isn't necessary for a config where everything runs at the same place but useful for some standalone stuff)

### Site
#### Maybes
- Make a site branch with a nice little documentation (Could be docusaurus)

## Implementation details
- [Section 4.1](https://tools.ietf.org/html/rfc2821#section-4.1)

## Notes
This is my foray into actual FOSS I want to put out into the world. I'm super open to PRs and/or suggestions on how to properly maintain and collaborate these kinds of things. If you see something in this README that doesn't make sense, feel free to create an issue with your recommendations!

## Fun Facts
I chose the name Posture because this is a tool written with Deno to test part of a communication system and dinosaurs used their posture to communicate certain things.<sup>[citation needed]</sup>

## License

Copyright © 2020 William Théroux

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.