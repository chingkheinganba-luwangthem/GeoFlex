@echo off
if "%JAVA_HOME%" == "" goto execute

:execute
java -Dmaven.multiModuleProjectDirectory=. -cp .mvn/wrapper/maven-wrapper.jar org.apache.maven.wrapper.MavenWrapperMain %*
