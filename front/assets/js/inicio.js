$(document).ready(function() {
  $("iframe").load(function() {
    $("iframe")
      .contents()
      .find(".controls,.titlebar")
      .hide();
  });
});
