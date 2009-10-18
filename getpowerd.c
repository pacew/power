#include <opus/opus.h>

void process (char *buf);

int vflag;


void
usage (void)
{
	fprintf (stderr, "usage: getpowerd [-vb] host\n");
	exit (1);
}

int seq;

int udpsock;

int background_flag;

int
main (int argc, char **argv)
{
	int c;
	char cmd[1000];
	struct sockaddr_in addr;
	char *host;
	int sock;
	int len;
	char buf[100000];
	int thistime;
	int n;

	while ((c = getopt (argc, argv, "vb")) != EOF) {
		switch (c) {
		case 'b':
			background_flag = 1;
			break;
		case 'v':
			vflag = 1;
			break;
		default:
			usage ();
		}
	}

	if (optind >= argc)
		usage ();

	host = argv[optind++];

	if (optind != argc)
		usage ();

	netlib_init ();

	if (netlib_bind (61341) < 0) {
		if (vflag)
			printf ("already running\n");
		exit (0);
	}

	if (background_flag)
		libopus_background (argv[0]);

	if (netlib_lookup (&addr, host, 80) < 0) {
		fprintf (stderr, "can't find %s\n", host);
		exit (1);
	}

	while (1) {
		if ((sock = socket (AF_INET, SOCK_STREAM, 0)) < 0) {
			fprintf (stderr, "can't create socket\n");
			exit (1);
		}

		if (connect (sock, (struct sockaddr *)&addr, sizeof addr) < 0) {
			fprintf (stderr, "connect error\n");
			exit (1);
		}

		seq++;
		sprintf (cmd,
			 "GET /history/secondhistory.xml"
			 "?INDEX=0&MTU=0&COUNT=4&u=%d HTTP/1.1\r\n"
			 "\r\n",
			 seq);
		write (sock, cmd, strlen (cmd));

		len = 0;
		while (len < sizeof buf - 1) {
			thistime = sizeof buf - 1 - len;
			if ((n = read (sock, buf + len, thistime)) <= 0)
				break;
			len += n;
		}
		buf[len] = 0;

		close (sock);

		process (buf);

		sleep (1);
	}

	return (0);
}

struct datapoint {
	int year, month, mday, hour, minute, second;
	double val;
};

#define NDATAPOINTS 100
struct datapoint datapoints[NDATAPOINTS];
struct datapoint last_pt;
struct datapoint curfile;

void output_point (struct datapoint *pt);
FILE *outf;

int
cmp_datapoint (void const *raw1, void const *raw2)
{
	struct datapoint const *arg1 = raw1;
	struct datapoint const *arg2 = raw2;
	int rc;

	if ((rc = arg1->year - arg2->year) != 0)
		return (rc);
	if ((rc = arg1->month - arg2->month) != 0)
		return (rc);
	if ((rc = arg1->mday - arg2->mday) != 0)
		return (rc);
	if ((rc = arg1->hour - arg2->hour) != 0)
		return (rc);
	if ((rc = arg1->minute - arg2->minute) != 0)
		return (rc);
	if ((rc = arg1->second - arg2->second) != 0)
		return (rc);
	return (0);
}

void
process (char *buf)
{
	char *p;
	int off;
	char *endp;
	int pointnum;
	struct datapoint *pt;
	int i;

	if (vflag) {
		printf ("%s\n\n", buf);
	}
	p = buf;
	pointnum = 0;
	while (1) {
		if (pointnum >= NDATAPOINTS)
			break;
		while (*p && !isdigit (*p))
			p++;
		if (*p == 0)
			break;
		pt = &datapoints[pointnum];

		if (sscanf (p, "%d/%d/%d %d:%d:%d%n",
			    &pt->month, &pt->mday, &pt->year,
			    &pt->hour, &pt->minute, &pt->second,
			    &off) == 6) {
			p += off;
			while (*p && !isdigit (*p))
				p++;
			pt->val = strtod (p, &endp) / 1000.0;
			p = endp;

			pointnum++;
		} else {
			p++;
		}
	}

	qsort (datapoints, pointnum, sizeof *datapoints, cmp_datapoint);

	for (i = 0, pt = datapoints; i < pointnum; i++, pt++) {
		if (cmp_datapoint (&last_pt, pt) < 0) {
			last_pt = *pt;
			output_point (pt);
		}
	}
}

void
output_point (struct datapoint *pt)
{
	char filename[1000];
	int x;

	if (outf) {
		if (pt->year != curfile.year
		    || pt->month != curfile.month
		    || pt->mday != curfile.mday) {
			fclose (outf);
			outf = NULL;
		}
	}

	if (outf == NULL) {
		sprintf (filename, "/var/power/pwr%4d-%02d-%02d", 
			 pt->year, pt->month, pt->mday);
		if ((outf = fopen (filename, "a")) == NULL) {
			fprintf (stderr, "can't create %s\n", filename);
			exit (1);
		}
		curfile = *pt;
	}
	
	x = pt->hour * 3600 + pt->minute * 60 + pt->second;

	fprintf (outf, "%d %.3f\n", x, pt->val);
	fflush (outf);
}

