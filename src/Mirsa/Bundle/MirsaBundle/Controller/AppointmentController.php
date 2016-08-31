<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\Appointment;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Resources\utilities\Filtering;

/**
 * AppointmentController
 *
 * @author Dave Hatch
 * @link
 */
class AppointmentController extends Controller
{
    /**
     * List all Appointments
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:Appointment:list.html.twig');
    }
    
    /**
     * View a sales order's details
     *
     * @param Appointment $appointment
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF') or has_role('ROLE_CLIENT_CONTACT')")
     */
    public function viewAction(Appointment $appointment)
    {
      /*  $so = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder')
            ->createQueryBuilder('so')
            ->select('*)')
            ->andWhere('so.id = :salesorder')
            ->getQuery();*/

        return $this->render(
            'MirsaMirsaBundle:Appointment:view.html.twig',
            array('appointment' => $appointment)
        );
    }

    /**
     * View an Appointment PDF
     *
     * @param Appointment $appointment
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(Appointment $appointment)
    {
        $containerUrl = $appointment->getPdf()->getUrl();

        $url = sprintf(
            '%s://%s:%s/%s',
            $this->container->getParameter('businessman.protocol'),
            $this->container->getParameter('businessman.host'),
            $this->container->getParameter('businessman.port'),
            $containerUrl
        );

        try {
            return new Response(file_get_contents($url), 200, array('Content-Type' => 'application/pdf'));
        } catch (\Exception $e) {
            throw $this->createNotFoundException();
        }
    }
    

    /* Used to export the records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $appointment = $request->query->get('appointment');
        $dateCreated = $request->query->get('dateCreated');
        $dateScheduled = $request->query->get('dateScheduled');
        $dateReceived = $request->query->get('dateReceived');
        $reference = $request->query->get('reference');
        $tradingCompanyName = $request->query->get('tradingCompanyName');
        $status = $request->query->get('status');

        //var_dump($request->query);exit;

        $response = new StreamedResponse();

        $response->setCallback(function() use (&$appointment, &$dateCreated, &$dateScheduled, &$dateReceived, &$reference, &$tradingCompanyName, &$status) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Appointment Number', 'Date Created', 'Scheduled Date', 'Received Date', 'Reference', 'Trading Company', 'Status'),',');

            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:Appointment');
            $qb = $qb->createQueryBuilder('ap');
            $qb = $qb->select('ap.appointmentNumber,ap.dateCreated,ap.dateScheduled,ap.dateReceived,ap.reference,ap.tradingCompanyName,ap.status');

            $filtering = new Filtering();

            if ($appointment != "" ) {
                $qb = $qb->andWhere('LOWER(ap.appointmentNumber) LIKE :appointmentNumber');
                $qb = $qb->setParameter('appointmentNumber', '%' . strtolower($appointment) . '%');
            }                        
            if ($dateCreated != "" ) {
                $filtering->DateFilter('dateCreated', $dateCreated, $qb, 'ap');
            }
            if ($dateScheduled != "" ) {
                $filtering->DateFilter('dateScheduled', $dateScheduled, $qb, 'ap');
            }
            if ($dateReceived != "" ) {
                $filtering->DateFilter('dateReceived', $dateReceived, $qb, 'ap');
            }            
            if ($reference != "" ) {
                $qb = $qb->andWhere('LOWER(ap.reference) LIKE :reference');
                $qb = $qb->setParameter('reference', '%' . strtolower($reference) . '%');
            }
            if ($tradingCompanyName != "" ) {
                $qb = $qb->andWhere('LOWER(ap.tradingCompanyName) LIKE :tradingCompanyName');
                $qb = $qb->setParameter('tradingCompanyName', '%' . strtolower($tradingCompanyName) . '%');
            }
            if ($status != "" ) {
                $qb = $qb->andWhere('LOWER(ap.status) LIKE :status');
                $qb = $qb->setParameter('status', '%' . strtolower($status) . '%');
            }

            $qb->innerJoin('ap' . '.client', 'c');
            
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb->andWhere('ap' . '.client = :client');
                    $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }

            /* Only export the items  for the currently logged in client*/
            /*if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('ap.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }*/
            $qb = $qb->getQuery();
            $appointments = $qb->getResult();

            foreach ($appointments as $item)
            {
                if (is_null($item['dateCreated']))
                {
                    $formattedDateCreated = "";
                } else {
                    $formattedDateCreated = date_format($item['dateCreated'], "m/d/Y");
                } 
                
                if (is_null($item['dateScheduled']))
                {
                    $formattedDateScheduled = "";
                } else {
                    $formattedDateScheduled = date_format($item['dateScheduled'], "m/d/Y");
                } 

                if (is_null($item['dateReceived']))
                {
                    $formattedDateReceived = "";
                } else {
                    $formattedDateReceived = date_format($item['dateReceived'], "m/d/Y");
                } 

                fputcsv($fc, array($item['appointmentNumber'],
                                $formattedDateCreated,
                                $formattedDateScheduled,
                                $formattedDateReceived,
                                $item['reference'],
                                $item['tradingCompanyName'],
                                $item['status']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "appointments_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
    
        return $response;
    }    

}