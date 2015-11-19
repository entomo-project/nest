<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Document\JobStatus;
use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;
use Doctrine\MongoDB\Collection;

class JobControllerTest extends AbstractBaseFunctionalTest
{
    public function testRetrieveAction()
    {
        $job = [
            'name' => 'test',
            'parameters' => [],
            'status' => JobStatus::JOB_STATUS_NEW,
        ];

        $this->getJobCollection()->insert($job);

        $this->jsonRequest(
            'GET',
            '/api/v1/job/'.(string)$job['_id']
        );

        $this->assertResponseHttpOk();

        $jsonResponse = $this->getJsonResponse();

        $this->assertArrayHasKey('result', $jsonResponse);

        $jsonResponseId = $jsonResponse['result']['id'];
        $jobId = $job['_id'];

        $this->assertSame($jsonResponseId, (string)$jobId);

        unset($jsonResponse['result']['id'], $job['_id']);

        $this->assertSame($jsonResponse['result'], $job);
    }

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

    public function testCreateActionSync()
    {
        $jobTransportStub = $this->getMock(\AppBundle\Transport\JobTransportInterface::class);

        $jobTransportStub->method(
            'submitJobToWorker'
        )->will($this->returnCallback(function ($workerAdress, $jobId, $jobName, $jobParameters) {
            $this->assertSame(
                '127.0.0.1',
                $workerAdress
            );
            $this->assertInstanceOf(
                \MongoId::class,
                $jobId
            );
            $this->assertSame(
                'test',
                $jobName
            );
            $this->assertSame(
                [
                    'foobar',
                ],
                $jobParameters
            );

            return [
                'status' => 'success',
                'result' => [
                    'bazquz',
                ],
            ];
        }));

        $this->container->set('app.transport.job', $jobTransportStub);

        $worker = [
            '_id' => '127.0.0.1',
        ];

        $this->getWorkerCollection()->insert($worker);

        $this->jsonRequest(
            'POST',
            '/api/v1/job',
            [
                'name' => 'test',
                'parameters' => [
                    'foobar',
                ],
                'sync' => true,
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
        $this->assertSame(
            [
                'foobar',
            ],
            $result[0]['parameters']
        );
        $this->assertSame(
            [
                'bazquz',
            ],
            $result[0]['result']
        );
        $this->assertSame(JobStatus::JOB_STATUS_DONE, $result[0]['status']);
    }

    /**
     * @return Collection
     */
    protected function getJobCollection()
    {
        return $this->container->get('app.document.collection.job');
    }

    /**
     * @return Collection
     */
    protected function getWorkerCollection()
    {
        return $this->container->get('app.document.collection.worker');
    }
}
