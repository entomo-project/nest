<?php

namespace AppBundle\Tests\Functional;

use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Client;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractBaseFunctionalTest extends WebTestCase
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

    /**
     * @return array
     */
    protected function getJsonResponse()
    {
        return json_decode($this->client->getResponse()->getContent(), true);
    }

    protected function assertStatusSuccess()
    {
        $jsonResponse = $this->getJsonResponse();

        $this->assertArrayHasKey('status', $jsonResponse);

        $this->assertSame('success', $jsonResponse['status']);
    }

    protected function assertResponseHttpOk()
    {
        $response = $this->client->getResponse();

        $this->assertSame(
            Response::HTTP_OK,
            $response->getStatusCode(),
            $response->getContent()
        );
    }

    /**
     * @param string $method
     * @param string $uri
     * @param array $jsonArrayContent
     * @param array  $parameters
     * @param array  $files
     * @param array  $server
     * @param bool   $changeHistory
     *
     * @return Crawler
     */
    protected function jsonRequest($method, $uri, array $jsonArrayContent = null, array $parameters = [], array $files = array(), array $server = array(), $changeHistory = true)
    {
        $jsonContent = isset($jsonArrayContent) ? json_encode($jsonArrayContent) : null;

        $mergedServer = array_merge(
            $server,
            [
                'CONTENT_TYPE' => 'application/json',
            ]
        );

        return $this->client->request($method, $uri, $parameters, $files, $mergedServer, $jsonContent, $changeHistory);
    }
}