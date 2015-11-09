<?php

namespace AppBundle\DependencyInjection;

use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ODM\MongoDB\Mapping\ClassMetadata;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Definition;
use Symfony\Component\DependencyInjection\Reference;

class RegisterRepositoriesCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $dm = $container->get('doctrine_mongodb.odm.document_manager');

        /* @var $dm DocumentManager */

        foreach ($dm->getMetadataFactory()->getAllMetadata() as $meta) {
            /* @var $meta ClassMetadata */

            $definition = new Definition();

            $definition->setFactory(
                [
                    new Reference('doctrine_mongodb.odm.document_manager'),
                    'getRepository',
                ]
            );

            $definition->setArguments(
                [
                    $meta->getReflectionClass()->getName()
                ]
            );

            $lcCamelCaseCollectionName = ContainerBuilder::underscore(
                $meta->getCollection()
            );

            $definition->addMethodCall(
                'setCollection',
                [
                    new Reference('app.document.collection.'.$lcCamelCaseCollectionName)
                ]
            );

            $container->setDefinition('app.document.repository.'.$lcCamelCaseCollectionName, $definition);
        }
    }
}