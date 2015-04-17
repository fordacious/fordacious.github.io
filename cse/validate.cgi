#!/usr/bin/perl
use CGI qw(:all -debug);

print header,start_html,"<pre>\n";
$card = param("card");

print validate($card);
    
print "</pre>\n",end_html;
exit 0;

sub validate () {
  $card = $_[0];
  $card =~ s/[^0-9]//g;
  @splitCardNum = split //, $card;
  if ($#splitCardNum != 15) {
    return "\"$card\" must contain 16 digits";
  }
  $i = $#splitCardNum;
  $sum = 0;
  $weight = 2;
  while ($i >= 0) {
    if ($weight == 1) {
      $weight = 2;
    } else {
      $weight = 1;
    }
    $tempNum = $splitCardNum[$i] * $weight;
    if ($tempNum > 9) {
      $sum += $tempNum - 9;
    } else {
      $sum += $splitCardNum[$i] * $weight;
    }
    $i -= 1;
  }
  
  return "$card is a valid credit card number\n" if $sum % 10 == 0;
  return "$card is *not* a valid credit card number\n";
}
