CFLAGS = -g -Wall
LIBS = -lopus -lm

all: getpowerd

getpowerd: getpowerd.o
	$(CC) $(CFLAGS) -o getpowerd getpowerd.o $(LIBS)

install: all
	install -c -m 755 getpowerd /usr/local/bin
