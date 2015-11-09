<?php

namespace AppBundle\DependencyInjection;

use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ODM\MongoDB\Mapping\ClassMetadata;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class RegisterCollectionsCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container)
    {
        $dm = $container->get('doctrine_mongodb.odm.document_manager');

        /* @var $dm DocumentManager */

        foreach ($dm->getMetadataFactory()->getAllMetadata() as $meta) {
            /* @var $meta ClassMetadata */

            $definition = new \Symfony\Component\DependencyInjection\Definition();

            $definition->setFactory(
                [
                    new \Symfony\Component\DependencyInjection\Reference('doctrine_mongodb.odm.document_manager'),
                    'getDocumentCollection',
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

            $container->setDefinition('app.document.collection.'.$lcCamelCaseCollectionName, $definition);
        }
    }
}