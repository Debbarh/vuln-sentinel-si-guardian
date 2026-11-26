# SPDX-License-Identifier: GPL-2.0-or-later
# Adapted from glpi-project/glpi-agent 1.21 bin/glpi-inventory.
# Copyright (C) 2010-2026 Teclib and contributors; Cyber-Skill modifications 2026.
# Local stdout-only inventory, fixed configuration, stable collector device ID.
use strict;
use warnings;
use setup;
use GLPI::Agent::Task::Inventory;
use GLPI::Agent::Target::Local;
use GLPI::Agent::Logger;
use GLPI::Agent::Config;
use GLPI::Agent::Version;

my ($id, $mode) = @ARGV;
die "Invalid invocation\n" unless @ARGV == 2 && $id =~ /^[a-f0-9-]{36}$/ && $mode =~ /^(inventory|version)$/;
if ($mode eq 'version') {
    print "$GLPI::Agent::Version::VERSION\n";
    exit 0;
}
umask 0077;
my $config = GLPI::Agent::Config->new(options => {
    config => 'none', json => 1, debug => 0,
    'backend-collect-timeout' => 20,
});
my $task = GLPI::Agent::Task::Inventory->new(
    target => GLPI::Agent::Target::Local->new(
        path => '-', json => 1, basevardir => $setup{vardir},
    ),
    deviceid => "cyber-skill-$id",
    logger => GLPI::Agent::Logger->new(config => $config),
    datadir => $setup{datadir}, config => $config,
);
$task->{nochecksum} = 1;
$task->run();
