# Posture
Posture is a simple configurable mock SMTP server to test your emails built with Deno. It is not meant to actually deliver anything. This server was designed only for receiving and saving SMTP commands for development, debugging or testing purposes. 

The SMTP server of this project implements the relevant parts of [RFC 2821](https://tools.ietf.org/html/rfc2821) to the best of my capacity/desire to for this project. To see what we've implemented, you can peep [the implementation list](#implentation-details).f there are certain parts of the standard that you need that aren't supported or don't work as they should, feel free to make a PR or file an issue!

## How to use
```sh
$ deno install --allow-net --allow-read --allow-write --allow-env path/to/repo
```

I don't think I need to tell you why we need net access. As for the other ones:
- **read** for the config file and SQLite if you happen to use that;
- **write** to use SQLite or MongoDB (Because of the plugin that needs to be written to disk);
- **env** to allow access to environment variables;
- **unstable** for plugins and MongoDB
- **plugin** for MongoDB plugin

## Dependencies
- Client: TBD
- API: [Oak](https://deno.land/x/oak)
- SMTP: None.
- Database: [DenoDB](https://deno.land/x/denodb)

## Supported Databases
- MongoDB
- PostgreSQL
- MySQL
- SQLite3

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
- 4.5.3.1 - Size limits and minimums
- Tests
- Documentation

#### Maybes
- Handle commands that seem torequire lookups
	- [ ] EHLO
	- [ ] VRFY
	- [ ] EXPN
- Implement some kind of communication system when new messages are added to the Database so a third-party could listen
- Allow custom database drivers
- CI/CD

### Server
#### Guarantees
- Basic REST API to get the available messages
- Tests
- Documentation

#### Maybes
- Run as SMTP + Server configuration
- Add some auth to access the API to secure emails
- Websocket or long polling connections to clients, SMTP Server or DB needs to implement some form of communication first
- CI/CD

### Client
#### Guarantees
- Choose framework
- Data fetching mechanisms
- List view of sent emails
- Detail view of emails

#### Maybes
- Run as Server + Client configuration
- Add some form of login to access the Server APIs
- Server-side rendering if the chosen framework needs it
- PWA (This probably isn't necessary for a config where everything runs at the same place but useful for some standalone stuff)

### Site
#### Maybes
- Make a site branch with a nice little documentation (Could be docusaurus)

## Implementation details
- [Section 4.1](https://tools.ietf.org/html/rfc2821#section-4.1)
- [Section 4.5.3.1](https://tools.ietf.org/html/rfc2821#section-4.5.3.1)

## Notes
This is my foray into actual FOSS I want to put out into the world. I'm super open to PRs and/or suggestions on how to properly maintain and collaborate on these kinds of things. If you see something in this README that doesn't make sense, feel free to create an issue with your recommendations!

## Fun Facts
I chose the name Posture because this is a tool written with Deno to test part of a communication system and dinosaurs used their posture to communicate certain things.<sup>[citation needed]</sup>

<small>Copyright © 2020 William Théroux</small>