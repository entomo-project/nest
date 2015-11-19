<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;
use Doctrine\MongoDB\Collection;

class WorkerControllerTest extends AbstractBaseFunctionalTest
{
    protected function createWorkerJob()
    {
        $job = [
            'workerId' => '127.0.0.1',
        ];

        $this->getJobCollection()->insert($job);
    }

    protected function ensureNoJob()
    {
        $this->assertSame(0, $this->getJobCollection()->count([ 'workerId' => '127.0.0.1', ]));
        $this->assertSame(1, $this->getJobCollection()->count());
    }

    public function testUnregisterWorkerAction()
    {
        $this->createWorkerJob();

        $worker = [
            '_id' => '127.0.0.1',
        ];

        $this->getWorkerCollection()->insert($worker);

        $this->jsonRequest(
            'DELETE',
            '/api/v1/worker/127.0.0.1'
        );

        $this->assertResponseHttpOk();

        $jsonResponse = $this->getJsonResponse();

        $this->assertSame(
            [
                'status' => 'success',
            ],
            $jsonResponse
        );

        $it = $this->getWorkerCollection()->find();

        $results = iterator_to_array($it);

        $this->assertCount(0, $results);

        $this->ensureNoJob();
    }

    public function testRegisterWorkerAction()
    {
        $this->createWorkerJob();

        $this->jsonRequest(
            'POST',
            '/api/v1/worker/127.0.0.1'
        );

        $this->assertResponseHttpOk();

        $jsonResponse = $this->getJsonResponse();

        $this->assertSame(
            [
                'status' => 'success',
            ],
            $jsonResponse
        );

        $it = $this->getWorkerCollection()->find();

        $results = array_values(
            iterator_to_array(
                $it
            )
        );

        $this->assertCount(1, $results);

        $this->assertSame(
            [
                '_id' => '127.0.0.1',
            ],
            $results[0]
        );

        $this->ensureNoJob();
    }

    /**
     * @return Collection
     */
    protected function getWorkerCollection()
    {
        return $this->container->get('app.document.collection.worker');
    }

    /**
     * @return Collection
     */
    protected function getJobCollection()
    {
        return $this->container->get('app.document.collection.job');
    }
}
