#!/usr/bin/perl
use CGI qw(:all -debug);

print header,start_html,"<pre>\n"; #header,

$inputText = "ENTER CARD NUMBER";

print '<FORM action="validate.cgi" method="GET">
First Name: <input type="text" name="card" value="Enter Card Num">  <br>
  <input type="submit" value="Submit">';
  print reset;
print '</FORM>';
print '<FORM action="bye.html" method="GET">';
  print submit('close','Close');
print '</FORM>';

print "</pre>\n",end_html;
exit 0;
