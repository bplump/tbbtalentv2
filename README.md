# TBB Talent Portal #

## Overview ##

This is the repository for the Talent Beyond Boundaries Talent Portal, which manages data 
for refugees looking for skilled migration pathways into safe countries and employment. 
 
This repository is a "mono-repo", meaning it contains multiple sub-modules all of which 
make up the TBB Talent Portal system. In particular it contains: 

- **server**: the backend module of the system providing secure API (REST) access to the 
data, stored in an SQL Database. This module is written in Java / Spring Boot.
- **candidate-portal (coming soon)**: the frontend module through which candidates (refugees seeking skilled 
migration) are able to register and manage their details. This is written in Angular and connects 
to the REST API endpoints under `/api/candidate` provided by the server. 
- **admin-portal (coming soon)**: the frontend module through which TBB staff are able to view, manage and annotate 
candidate details. This is written in Angular and connects to the REST API endpoints under 
`/api/admin` provided by the server.
     
## How do I get set up? ##

### Install the tools ###

Download and install the latest of the following tools: 

- Git [https://git-scm.com/downloads]()
- Java JDK8 [https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html]()
- Gradle [https://gradle.org/install/]()
- PostgreSQL [https://www.postgresql.org/download/]()
- NodeJS [https://nodejs.org/en/]()
- Angular CLI [https://angular.io/cli]()
- IntelliJ IDEA (or the IDE of your choice) [https://www.jetbrains.com/idea/download/]()

### Setup your local database ###

- todo: we don't have a database yet, so this step will be filled in later

### Download and edit the code ###

- Clone [the repository](https://bitbucket.org/johncameron/tbbtalentv2/src/master/) to your local system
- Open the root folder in IntelliJ IDEA (it should auto detect gradle and self-configure)

### Run the server ###

- Create a new Run Profile for `org.tbbtalent.server.TbbTalentApplication`
- Run the new profile, you should see something similar to this in the logs: 
```
Started TbbTalentApplication in 2.217 seconds (JVM running for 2.99)
```
- your server will be running on port 8080
- To test it open a browser to [http://localhost:8080/test]()


### Run the Candidate Portal ###

- we will fill this in when once we've setup the Candidate Portal

### Run the Admin Portal ###

- we will fill this in when once we've setup the Admin Portal
