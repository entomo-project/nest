<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;

class WorkerControllerTest extends AbstractBaseFunctionalTest
{
    public function testUnregisterWorkerAction()
    {
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
    }

    public function testRegisterWorkerAction()
    {
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
    }

    /**
     * @return \Doctrine\MongoDB\Collection
     */
    protected function getWorkerCollection()
    {
        return $this->container->get('app.document.collection.worker');
    }
}
