<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;

class DefaultControllerTest extends AbstractBaseFunctionalTest
{
    public function testCreateAction()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/');

        $this->assertEquals(200, $client->getResponse()->getStatusCode());
    }
}
