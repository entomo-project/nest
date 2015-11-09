<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Document\JobStatus;
use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;
use Doctrine\MongoDB\Collection;

class JobControllerTest extends AbstractBaseFunctionalTest
{
    public function testCreateAction()
    {
        $this->jsonRequest(
            'POST',
            '/api/v1/job',
            [
                'name' => 'test',
                'parameters' => [],
            ]
        );

        $this->assertResponseHttpOk();

        $this->assertStatusSuccess();

        $jsonResponse = $this->getJsonResponse();

        $this->assertArrayHasKey('result', $jsonResponse);
        $this->assertArrayHasKey('id', $jsonResponse['result']);

        $this->assertInternalType('string', $jsonResponse['result']['id']);

        $it = $this->getJobCollection()->find();

        $result = array_values(iterator_to_array($it));

        $this->assertCount(1, $result);

        $this->assertSame($jsonResponse['result']['id'], (string)$result[0]['_id']);
        $this->assertSame('test', $result[0]['name']);
        $this->assertSame([], $result[0]['parameters']);
        $this->assertSame(JobStatus::JOB_STATUS_NEW, $result[0]['status']);
    }

    /**
     * @return Collection
     */
    protected function getJobCollection()
    {
        return $this->container->get('app.document.collection.job');
    }
}
