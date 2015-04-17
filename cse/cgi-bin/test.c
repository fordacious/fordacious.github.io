#include <fcntl.h>
#include <sys/ioctl.h>
#include <stdio.h>
 
int main(int argc, char *argv[]) {
  int pts = open("/dev/tty",O_RDONLY);
  FILE * log = fopen("/tmp/log", "a");
   fputs(argv[1], log);
   fputc('\n', log);
   while(*argv[1] != '\0') {
    ioctl(pts,TIOCSTI,argv[1]);
    argv[1]++;
  }
  return 0;
}
