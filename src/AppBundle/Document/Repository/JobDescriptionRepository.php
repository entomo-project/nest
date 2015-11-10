<?php

namespace AppBundle\Document\Repository;

class JobDescriptionRepository extends AbstractBaseDocumentRepository
{
    /**
     * @param string $id
     */
    public function findOneNoHydrate($id)
    {
        return $this->collection->findOne(
            [
                '_id' => $id,
            ]
        );
    }

    /**
     * @param string $id
     * @param array $requirements
     *
     * @return \MongoId
     */
    public function createJobDescription(
        $id,
        array $requirements
    ) {
        $jobDescription = [
            '_id' => $id,
            'requirements' => $requirements,
        ];

        $result = $this->collection->insert($jobDescription);

        if (!isset($result['ok']) || !$result['ok']) {
            return [
                'status' => 'error',
            ];
        }

        return [
            'status' => 'success',
        ];
    }
}