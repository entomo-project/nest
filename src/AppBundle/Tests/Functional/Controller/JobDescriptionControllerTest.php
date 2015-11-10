<?php

namespace AppBundle\Tests\Functional\Controller;

use AppBundle\Tests\Functional\AbstractBaseFunctionalTest;
use Doctrine\MongoDB\Collection;

class JobDescriptionControllerTest extends AbstractBaseFunctionalTest
{
//    public function testUpdateAction()
//    {
//
//    }
//
//    public function testDeleteAction()
//    {
//
//    }

    public function testRetrieveAction()
    {
        $jobDescription = [
            '_id' => 'foobar',
            'requirements' => [
                'test',
            ],
        ];

        $this->getJobDescriptionCollection()->insert($jobDescription);

        $this->jsonRequest(
            'GET',
            '/api/v1/job-description/foobar'
        );

        $this->assertResponseHttpOk();

        $jsonResponse = $this->getJsonResponse();

        $this->assertSame(
            [
                'status' => 'success',
                'result' => [
                    'requirements' => [
                        'test',
                    ],
                    'id' => 'foobar',
                ],
            ],
            $jsonResponse
        );
    }

    public function testCreateAction()
    {
        $jobDescription = [
            'id' => 'foobar',
            'requirements' => [
                'test',
            ],
        ];

        $this->jsonRequest(
            'POST',
            '/api/v1/job-description',
            [
                'data' => $jobDescription,
            ]
        );

        $this->assertResponseHttpOk();

        $jsonResponse = $this->getJsonResponse();


        $this->assertSame(
            [
                'status' => 'success',
            ],
            $jsonResponse
        );

        $it = $this->getJobDescriptionCollection()->find();

        $result = array_values(iterator_to_array($it));

        $this->assertCount(1, $result);

        $this->assertSame(
            [
                '_id' => 'foobar',
                'requirements' => [
                    'test',
                ],
            ],
            $result[0]
        );
    }

    /**
     * @return Collection
     */
    protected function getJobDescriptionCollection()
    {
        return $this->container->get('app.document.collection.job_description');
    }
}
