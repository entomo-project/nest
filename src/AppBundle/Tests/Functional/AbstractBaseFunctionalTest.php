<?php

namespace AppBundle\Tests\Functional;

use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Client;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DependencyInjection\Container;

class AbstractBaseFunctionalTest extends WebTestCase
{
    /**
     * @var Client
     */
    protected $client;

    /**
     * @var Container
     */
    protected $container;

    /**
     * {@inheritdoc}
     */
    public function setUp()
    {
        parent::setUp();

        $this->client = static::createClient();

        $this->container = $this->client->getContainer();

        $this->clearDatabase();
    }

    private function clearDatabase()
    {
        $documentManager = $this->getDocumentManager();

        $defaultDb = $documentManager->getConfiguration()->getDefaultDB();

        $documentManager->getConnection()->selectDatabase($defaultDb)->drop();
    }

    /**
     * @return DocumentManager
     */
    protected function getDocumentManager()
    {
        return $this->container->get('doctrine_mongodb.odm.document_manager');
    }
}