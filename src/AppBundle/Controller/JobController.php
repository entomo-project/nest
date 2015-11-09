<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class JobController extends Controller
{
    public function retrieveAction()
    {
        return new \Symfony\Component\HttpFoundation\JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }

    public function createAction()
    {
        

        return new \Symfony\Component\HttpFoundation\JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }

    public function abortAction()
    {
        return new \Symfony\Component\HttpFoundation\JsonResponse(
            [
                'status' => 'success',
            ]
        );
    }
}
