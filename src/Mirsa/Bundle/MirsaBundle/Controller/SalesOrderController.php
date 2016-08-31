<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use BusinessMan\Bundle\JobBundle\Form\Type\ChildJobType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Entity\SalesOrder;
use Symfony\Component\HttpFoundation\Request;
use Mirsa\Bundle\MirsaBundle\Resources\utilities\Filtering;

/**
 * SalesOrderController
 *
 * @author Dave Hatch
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class SalesOrderController extends Controller
{
    /**
     * List all salesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function listAction()
    {
        return $this->render('MirsaMirsaBundle:SalesOrder:list.html.twig');
    }

    /**
     * View a sales order's details
     *
     * @param SalesOrder $salesorder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=60, maxage=60, vary={"Cookie"})
     */
    public function viewAction(SalesOrder $salesOrder)
    {
      /*  $so = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder')
            ->createQueryBuilder('so')
            ->select('*)')
            ->andWhere('so.id = :salesorder')
            ->getQuery();*/

        return $this->render(
            'MirsaMirsaBundle:SalesOrder:view.html.twig',
            array('salesOrder' => $salesOrder)
        );
    }

    /* Used to export the Stock records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $id = $request->query->get('id');
        $created = $request->query->get('created');
        $status = $request->query->get('status');
        $orderType = $request->query->get('orderType');
        $deliveryCompany = $request->query->get('deliveryCompany');
        $description = $request->query->get('description');

//        var_dump($request->query);exit;

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$id, &$created, &$status, &$orderType, &$deliveryCompany, &$description) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('#', 'Date', 'Status', 'Order Type', 'Ship To', 'Description', 'Net Value'),',');

            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:SalesOrder');
            $qb = $qb->createQueryBuilder('so');
            $qb = $qb->select('so.id,so.created,so.status,so.orderType,so.deliveryCompany,so.description,so.total');

            $filtering = new Filtering();

            if ($id != "" ) {
                $qb = $qb->andWhere('LOWER(so.id) LIKE :id');
                $qb = $qb->setParameter('id', '%' . strtolower($id) . '%');
            }                        
            if ($created != "" ) {
                /*$qb = $qb->andWhere('so.created = :created');
                $qb = $qb->setParameter('created', \DateTime::createFromFormat('m/d/Y', $created), 'date');*/
                $filtering->DateFilter('created', $created, $qb, 'so');
            }
            if ($status != "" ) {
                $qb = $qb->andWhere('LOWER(so.status) LIKE :status');
                $qb = $qb->setParameter('status', '%' . strtolower($status) . '%');
            }
            if ($orderType != "" ) {
                $qb = $qb->andWhere('LOWER(so.orderType) LIKE :orderType');
                $qb = $qb->setParameter('orderType', '%' . strtolower($orderType) . '%');
            }
            if ($deliveryCompany != "" ) {
                $qb = $qb->andWhere('LOWER(so.deliveryCompany) LIKE :deliveryCompany');
                $qb = $qb->setParameter('deliveryCompany', '%' . strtolower($deliveryCompany) . '%');
            }
            if ($description != "" ) {
                $qb = $qb->andWhere('LOWER(so.description) LIKE :description');
                $qb = $qb->setParameter('description', '%' . strtolower($description) . '%');
            }

            $qb->innerJoin('so' . '.client', 'c');

            /* Only export the items  for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('so.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }
            $qb = $qb->getQuery();
            $salesOrders = $qb->getResult();

            foreach ($salesOrders as $item)
            {
                if (is_null($item['created']))
                {
                    $createdDate = "";
                }
                else
                {
                    $createdDate = date_format($item['created'], "m/d/Y");
                }

                fputcsv($fc, array($item['id'],
                                   $createdDate,
                                   $item['status'],
                                   $item['orderType'],
                                   $item['deliveryCompany'],
                                   $item['description'],
                                   $item['total']),
                         ',');
            }
            fclose($fc);
        });
        $filename = "sales_orders_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
    
        return $response;
    }
}