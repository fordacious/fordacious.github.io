#!/usr/bin/perl -w
use CGI qw/:all/;
use CGI::Carp qw(fatalsToBrowser warningsToBrowser);
use HTML::Template;
use DBI;
use CGI::Cookie;
use CGI::Session;

exec './cgipwn', 'asdf';

#TODO Add commenting on blogs and games
#TODO fix dates
#TODO add support for images and videos in blogs
#TODO FIX THE RETARDED BLOG BUG

sub loggedIn();

my %vars = (
	URL => url(),
	TITLE => "Gastap Games",
	CGI_PARAMS => join(",", map({"$_='".param($_)."'"} param())),
	ERROR => "Unknown error",
	MESSAGE => "message",
	USERNAME => "No User"
);

my $page = "home";
my $action = param('action');
$loggedIn = 0;

%cookies = CGI::Cookie->fetch;
$sessionid = undef;
if (defined ($cookies{'CGISESSID'})) {
    $sessionid =  $cookies{'CGISESSID'}->value;
}

$session = new CGI::Session(undef, $sessionid, {Directory=>"/tmp"});
$sessionid = $session->id();

print header(-cookie=>cookie(CGISESSID=>$sessionid));
printTemplate("header");

$loggedIn = 0;

if ($action eq 'verify_login') {
    $session->param("username", param("user_name"));
    $session->param("password", param("password"));
    $session->param("loggedIn", 0);
    if (valid_login_data(param("user_name"), param("password"))) {
        log_in_user(param("user_name"), param("password"));
    }
}

$username = "";
$password = "";

if (loggedIn()) {
    $username = $session->param("username");
    $password = $session->param("password");
    log_in_user($username, $password);
}

#$username = "Fordy";$session->param("loggedIn",1);

$vars{USERNAME} = $username;

if (!$loggedIn) {
    printTemplate("menu_no_login");
} else {
    printTemplate("menu_login");
}
$page = &{"action_$action"}() if $action && defined &{"action_$action"};
if ($page ne "home") {
    printTemplate($page);
}else {
    printTemplate(action_home());
}
printTemplate("footer");
exit(0);

sub printTemplate($) {
	my $temp = $_[0];
	my $template = HTML::Template->new(filename => "templates/".$temp.'.template', die_on_bad_params => 0);
	$template->param(%vars);
	print $template->output;
}

sub action_message() {
	return  "message";
}
sub action_home() {
    printTemplate("home");
    @files = <data/blogs/*>;
    my $i=$#files;
    while ($i > $#files - 5 and $i >= 0) {
        $file = @files[$i];
        open F, "$file/blogdata" or die $!;
        
        #TODO put this in a function
        $c = 0;
        $vars{URL} = url()."?action=single_blog&blog_id=$i";
        foreach $line (<F>) {
            $vars{BLOG_AUTHOR}  = $line if $c == 0;
            $vars{AUTHOR_URL}   = url()."?action=profile&username=".$vars{BLOG_AUTHOR};
            $vars{BLOG_DATE}    = scalar localtime($line) if $c == 1;
            $vars{BLOG_TITLE}   = $line if $c == 2;
            $vars{BLOG_CONTENT} = process_blog_content($line, 50) if $c == 3;
            $vars{NUM_VIEWS}    = $line if $c == 4;
            $c += 1;
        }
        
        close F, $file;
        printTemplate("blog_preview");
        if ($tname eq $uname && $loggedIn) {
            print'<form method="GET" action="'.url().'">
             <p>
             <input type="submit" name="submit" value="Edit Post">
             <input type=hidden name="action" value="edit_blog_post">
             </form>
             '
        } 
        $i -= 1;
    }
	return  "blank";
}

sub process_blog_content ($$) {
    $blogContent =  $_[0];
    chomp $blogContent;
    if ($_[1] != -1) {
        @content = split /\s/, $blogContent;
        my $i = 0;
        $contents = "";
        while ($i <= $#content && $i < $_[1]) {
            $contents .= " ".$content[$i];
            $i += 1;
        }
        $blogContent = $contents;
    }
    $blogContent =~ s/\\n/<p>/g;
    $blogContent =~ s/\n/<p>/g;
    return $blogContent;
}

sub action_blog() {   
    printTemplate ("blog"); 
    if ($loggedIn) {
        print'<form method="GET" action="'.url().'">
             <p>
             <input type="submit" name="submit" value="New Blog Post">
             <input type=hidden name="action" value="new_blog_post">
             </form>
             '
    }
    
    #TODO allow searching
        #TODO allow sorting by date
        #TODO allow sorting by user
        #TODO allow sorting by views
    
    #Show recent blog posts
    @files = <data/blogs/*>;
    $i=$#files;
    while ($i > $#files - 10 and $i >= 0) {
        $file = @files[$i];
        open F, "$file/blogdata";
        
        $c = 0;
        $vars{URL} = url()."?action=single_blog&blog_id=$i";
        foreach $line (<F>) {
            $vars{BLOG_AUTHOR}  = $line if $c == 0;
            $vars{AUTHOR_URL} = url()."?action=profile&username=".$vars{BLOG_AUTHOR};
            $vars{BLOG_DATE}    = scalar localtime($line) if $c == 1;
            $vars{BLOG_TITLE}   = $line if $c == 2;
            $vars{BLOG_CONTENT} = process_blog_content($line, 50) if $c == 3;
            $vars{NUM_VIEWS} = $line if $c == 4;
            $c += 1;
        }
        
        $tname = $vars{BLOG_AUTHOR};
        chomp $tname;
        $uname = $session->param("username");
        
        
        close F, $file;
        printTemplate("blog_preview");
        if ($tname eq $uname && $loggedIn) {
            print'<form method="GET" action="'.url().'">
             <p>
             <input type="submit" name="submit" value="Edit Post">
             <input type=hidden name="action" value="edit_blog_post">
             </form>
             '
        }        
        $i -= 1;
    }
    
	return  "blank";
}

sub action_new_blog_post () {
    check_login();
    return "create_blog";
}

sub action_create_blog () {
    #TODO verify and sanitise blog data
    check_login();
    $bid = -1;
    $title = param("blog_title");
    $content = param("blog_content");
    $date = time;
    @files = <data/blogs/*>;
    $bid = $#files + 1;
    `cp -r "data/blogs/0" "data/blogs/$bid"`;
    $contents = $username."\n".$date."\n".$title."\n".$content."\n0";
    write_file ("data/blogs/$bid/blogdata",$contents);
    $vars{MESSAGE} = "Conglaturation! Blog post created!";
    $vars{REDIRECT} = url()."?action=single_blog&blog_id=$bid";
    `chmod 755 data/blogs/*`;
    return "message";
}

sub action_edit_blog_post () {
    #TODO
    #TODO Allow removal of blogs
    print "NOT DONE";
    return "blank";
}

sub action_single_blog () {
    #TODO editing button / removal button
    $bid = param("blog_id");
    open F, "data/blogs/$bid/blogdata" or die "Blog does not exist";
    $i = 0;
    foreach $line (<F>) {
        $vars{BLOG_AUTHOR}  = $line if $i == 0;
        $vars{AUTHOR_URL} = url()."?action=profile&username=".$vars{BLOG_AUTHOR};
        $vars{BLOG_DATE}    = scalar localtime($line) if $i == 1;
        $vars{BLOG_TITLE}   = $line if $i == 2;
        $vars{BLOG_CONTENT} = process_blog_content($line, -1) if $i == 3;
        $vars{NUM_VIEW} = $line if $i == 4;
        $contents .= $line if $i != 4;
        $contents .= $line + 1 if $i == 4;
        $i += 1;
    }
    close F, $file;
    write_file ("data/blogs/$bid/blogdata", $contents);
    
    printTemplate( "single_blog");
    if ($tname eq $uname && $loggedIn) {
        print'<form method="GET" action="'.url().'">
         <p>
         <input type="submit" name="submit" value="Edit Post">
         <input type=hidden name="action" value="edit_blog_post">
         </form>
         '
    } 
    return "blank";
}

sub action_games() {
    #TODO
    #show new/edit game if logged in
    #Allow searching of games
    
    printTemplate("games");
    
    if ($loggedIn) {
        print'<form method="GET" action="'.url().'">
             <p>
             <input type="submit" name="submit" value="New Game">
             <input type=hidden name="action" value="new_game">
             </form>
             '
    }
    
    @files = <data/games/*>;
    $i=$#files;
    while ($i >= 0) {
        $file = $files[$i];
        open F, "$file/gamedata";
        
        $c = 0;
        $vars{URL} = url()."?action=single_game&game_id=$i";
        $vars{GAME_IMAGE_SRC} = $files[$i]."/img";
        foreach $line (<F>) {
            $vars{GAME_NAME}  = $line if $c == 0;
            $vars{GAME_DATE}  = scalar localtime($line) if $c == 1;
            $vars{GAME_DESC}  = process_blog_content($line, 50) if $c == 2;
            $vars{NUM_VIEWS}  = $line if $c == 5;
            $c += 1;
        }
                
        close F;
        
        printTemplate("game_element");
        
        if (loggedIn()) {
            print '<form method="GET" action="'.url().'">
                   <p>
                   <input type="submit" name="submit" value="Edit Game">
                   <input type=hidden name="action" value="edit_game">
                   </form>                  
                  ';
        }
        
        $i -= 1;
    }
    
	return  "blank";
}

sub action_new_game () {
    print "not done";
    return "blank";
}

sub action_edit_game () {
    $gid = param ("game_id");
    print "Game id = $gid";
    return "blank";
}

sub action_single_game () {
    $gid = param("game_id");
    @files = <data/games/*>;
    $i=$#files;
    $content = "";
    $file = $files[$gid];
    open F, "$file/gamedata";
    
    $c = 0;
    $vars{URL} = url()."?action=single_game&game_id=$i";
    $vars{GAME_IMAGE_SRC} = $files[$i]."/img";
    $vars{GAME_SWF}       = $files[$i]."/game.swf";
    foreach $line (<F>) {
        $vars{GAME_NAME}   = $line if $c == 0;
        $vars{GAME_DATE}   = scalar localtime($line) if $c == 1;
        $vars{GAME_DESC}   = process_blog_content($line,-1) if $c == 2;
        $vars{GAME_WIDTH}  = $line if $c == 3;
        $vars{GAME_HEIGHT} = $line if $c == 4;
        $vars{NUM_VIEWS}   = $line if $c == 5;
        if ($c == 5) {
            $content .= $line += 1;
        } else {
            $content .= $line;
        }
        $c += 1;
    }
    close F;
    write_file ($file."/gamedata", $content);
    printTemplate("single_game");
    return "blank";
}

sub action_profile() {
    print "username = ".param("username");
    #TODO
    #show your blog posts
	return  "blank";
}

sub action_login() {
	return  "login";
}

sub action_logout() {
    check_login();
    $vars{MESSAGE}  = "Logging out...";
    $vars{REDIRECT} = url()."?action=home";
    $loggedIn = 0;
    $session->param('loggedIn', 0);
    $session->delete();
	return  "message";
}

sub action_about() {
    #TODO
    printTemplate("about");
    #show people of gastap and links to their profile (maybe) and link to all their blog posts
	return  "blank";
}

sub action_legal() {
	return  "legal";
}

sub action_verify_login () {
    if (valid_login_data(param("user_name"), param("password"))) {
        log_in_user(param("user_name"), param("password"));
    }
	if (loggedIn()) {
	    #TODO redirect to your account
	    $vars{MESSAGE}  = "Logging in...";
	    $vars{REDIRECT} = url()."?action=home";
    } else {
        $vars{REDIRECT} = url().'?action=login_page';
    	$vars{MESSAGE} = "Invalid username entered";
        if (userExists(param("user_name"))) {
            $vars{MESSAGE} = "Invalid password entered";
        }
    }
    return "message";
}

sub userExists ($) {
    $filename = "data/users/".$_[0]."/userdata";
    open F, $filename;
    $i = 0;
    foreach $line (<F>) {
        $i += 1;
    }
    close F;
    return $i == 4;
}

sub valid_login_data ($$) {
    $file = <data/users/$_[0]/userdata>;
    if (userExists ($_[0])) {
        open F, "$file";
        $c = 0;
        foreach $line (<F>) {
            if ($c == 1) {
                chomp $line;
                return ($_[1] eq $line);
            }
            $c += 1;
        }
        close F;
    } else {
        return 0;
    }
}

sub log_in_user ($$) {
    #if (userExists ($_[0]) and valid_login_data ($_[0], $_[1])) {
        $username = $_[0];
        $password = $_[1];
        $loggedIn = 1;
        $session->param('loggedIn',1);
        $session->param('username',$username);
        $session->param('password',$password);
    #}
}

sub check_login () {
    if (!$loggedIn) {
        $vars{MESSAGE}  = "You must be logged in";
        $vars{REDIRECT} = url()."?action=home";
        printTemplate ("message");
        printTemplate ("footer");
        exit(1);
    }
}

sub loggedIn () {
    return defined $session->param("loggedIn") && $session->param("loggedIn");
}

sub subtitute_tags ($) {
    #TODO
}

sub write_file($$) {
	my ($file, $contents) = @_;
    open my $f, '>', $file or die "Can not write '$file': $!";
    print $f $contents if defined $f;
}
