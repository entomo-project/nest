<?php

namespace AppBundle;

use AppBundle\DependencyInjection\RegisterCollectionsCompilerPass;
use AppBundle\DependencyInjection\RegisterRepositoriesCompilerPass;
use Symfony\Component\DependencyInjection\Compiler\PassConfig;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class AppBundle extends Bundle
{
    public function build(ContainerBuilder $container)
    {
        $container->addCompilerPass(new RegisterCollectionsCompilerPass(), PassConfig::TYPE_BEFORE_REMOVING);
        $container->addCompilerPass(new RegisterRepositoriesCompilerPass(), PassConfig::TYPE_BEFORE_REMOVING);
    }
}
